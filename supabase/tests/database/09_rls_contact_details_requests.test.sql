-- RLS: contato privado, solicitações de contato e redes sociais.

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(17);

-- Setup ---------------------------------------------------------------------------------------

insert into auth.users (id, email, raw_user_meta_data) values
  (
    '11111111-1111-1111-1111-111111111111',
    'guardian1@test.com',
    '{"role":"guardian","full_name":"Guardian One","phone":"+5511999990001"}'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'guardian2@test.com',
    '{"role":"guardian","full_name":"Guardian Two","phone":"+5511999990002"}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'teacher1@test.com',
    '{"role":"teacher","full_name":"Teacher One","phone":"+5511999990003"}'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'teacher2@test.com',
    '{"role":"teacher","full_name":"Teacher Two","phone":"+5511999990004"}'::jsonb
  );

-- teacher1 publicado: verificação aprovada + trial.
update public.teacher_verifications
set status = 'approved'
where teacher_id = '33333333-3333-3333-3333-333333333333';

insert into public.subscriptions (
  teacher_id, plan_id, status, current_period_start, current_period_end
)
values (
  '33333333-3333-3333-3333-333333333333',
  'teacher_launch',
  'trialing',
  now(),
  now() + interval '7 days'
);

-- teacher2 aprovado, mas sem assinatura -> não publicado.
update public.teacher_verifications
set status = 'approved'
where teacher_id = '44444444-4444-4444-4444-444444444444';

insert into public.teacher_social_links (teacher_id, network, url)
values ('33333333-3333-3333-3333-333333333333', 'instagram', 'https://instagram.com/teacher1');

-- guardian1 ------------------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select isnt_empty(
  $$select phone from public.contact_details
    where user_id = '11111111-1111-1111-1111-111111111111'$$,
  'responsável lê o próprio celular'
);

select is_empty(
  $$select phone from public.contact_details
    where user_id = '22222222-2222-2222-2222-222222222222'$$,
  'responsável não lê o celular de outro responsável'
);

select results_eq(
  $$update public.contact_details
    set phone = '+5511988880001'
    where user_id = '11111111-1111-1111-1111-111111111111'
    returning phone$$,
  array['+5511988880001'::text],
  'responsável edita o próprio celular'
);

select is_empty(
  $$select phone from public.contact_details
    where user_id = '33333333-3333-3333-3333-333333333333'$$,
  'responsável não lê o celular do professor antes do aceite'
);

select lives_ok(
  $$insert into public.contact_requests (
      teacher_id,
      guardian_name,
      student_name,
      student_school_grade,
      reason
    )
    values (
      '33333333-3333-3333-3333-333333333333',
      'Guardian One',
      'Student One',
      'elementary_1',
      'Reforço de matemática'
    )$$,
  'responsável cria solicitação para professor publicado'
);

select throws_ok(
  $$insert into public.contact_requests (
      teacher_id,
      guardian_name,
      student_name,
      student_school_grade,
      reason
    )
    values (
      '44444444-4444-4444-4444-444444444444',
      'Guardian One',
      'Student One',
      'elementary_1',
      'Reforço de física'
    )$$,
  '42501',
  null,
  'responsável não cria solicitação para professor não publicado'
);

-- Outros usuários não leem a solicitação -------------------------------------------------------

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$select id from public.contact_requests
    where guardian_id = '11111111-1111-1111-1111-111111111111'
      and teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'outro responsável não lê a solicitação'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';

select is_empty(
  $$select id from public.contact_requests
    where guardian_id = '11111111-1111-1111-1111-111111111111'
      and teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'outro professor não lê a solicitação'
);

select is_empty(
  $$update public.contact_requests
    set status = 'accepted'
    where guardian_id = '11111111-1111-1111-1111-111111111111'
      and teacher_id = '33333333-3333-3333-3333-333333333333'
    returning id$$,
  'outro professor não aceita a solicitação'
);

-- Professor destinatário lê e aceita -----------------------------------------------------------

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

select isnt_empty(
  $$select id from public.contact_requests
    where guardian_id = '11111111-1111-1111-1111-111111111111'
      and teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'professor destinatário lê a solicitação'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select throws_ok(
  $$update public.contact_requests
    set status = 'accepted'
    where guardian_id = '11111111-1111-1111-1111-111111111111'
      and teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'P0001',
  'contact_request_not_allowed',
  'responsável não altera o status da solicitação'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

select results_eq(
  $$update public.contact_requests
    set status = 'accepted'
    where guardian_id = '11111111-1111-1111-1111-111111111111'
      and teacher_id = '33333333-3333-3333-3333-333333333333'
    returning status$$,
  array['accepted'::public.contact_request_status],
  'professor aceita a solicitação'
);

-- Depois do aceite -----------------------------------------------------------------------------

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select isnt_empty(
  $$select phone from public.contact_details
    where user_id = '33333333-3333-3333-3333-333333333333'$$,
  'responsável lê o celular do professor depois do aceite'
);

select isnt_empty(
  $$select url from public.teacher_social_links
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'responsável lê as redes sociais do professor depois do aceite'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

select isnt_empty(
  $$select phone from public.contact_details
    where user_id = '11111111-1111-1111-1111-111111111111'$$,
  'professor lê o celular do responsável depois do aceite'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$select phone from public.contact_details
    where user_id = '33333333-3333-3333-3333-333333333333'$$,
  'outro responsável continua sem ler o celular do professor'
);

select is_empty(
  $$select url from public.teacher_social_links
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'outro responsável continua sem ler as redes sociais do professor'
);

select * from finish();
rollback;
