-- RLS: leitura e edição de profiles.

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(10);

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

-- teacher1 fica publicado: verificação aprovada + assinatura em teste.
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

-- teacher2 não tem assinatura, então não deve aparecer para anônimo.
update public.teacher_verifications
set status = 'approved'
where teacher_id = '44444444-4444-4444-4444-444444444444';

-- guardian1 ------------------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select isnt_empty(
  $$select id from public.profiles where id = '11111111-1111-1111-1111-111111111111'$$,
  'responsável lê o próprio perfil'
);

select is_empty(
  $$select id from public.profiles where id = '22222222-2222-2222-2222-222222222222'$$,
  'responsável não lê o perfil de outro responsável'
);

select results_eq(
  $$update public.profiles
    set full_name = 'Guardian One Updated'
    where id = '11111111-1111-1111-1111-111111111111'
    returning full_name$$,
  array['Guardian One Updated'::text],
  'responsável edita o próprio perfil'
);

select is_empty(
  $$update public.profiles
    set full_name = 'Hacked'
    where id = '22222222-2222-2222-2222-222222222222'
    returning id$$,
  'responsável não edita o perfil de outro responsável'
);

select throws_ok(
  $$update public.profiles
    set role = 'teacher'
    where id = '11111111-1111-1111-1111-111111111111'$$,
  '42501',
  null,
  'responsável não altera o próprio papel'
);

select throws_ok(
  $$insert into public.profiles (id, full_name)
    values ('55555555-5555-5555-5555-555555555555', 'Novo Perfil')$$,
  '42501',
  null,
  'responsável não insere perfil diretamente'
);

select throws_ok(
  $$delete from public.profiles
    where id = '11111111-1111-1111-1111-111111111111'$$,
  '42501',
  null,
  'responsável não apaga o próprio perfil'
);

-- anônimo --------------------------------------------------------------------------------------

reset role;
set local role anon;
reset request.jwt.claim.sub;

select is_empty(
  $$select id from public.profiles where id = '11111111-1111-1111-1111-111111111111'$$,
  'anônimo não lê perfil de responsável'
);

select isnt_empty(
  $$select id from public.profiles where id = '33333333-3333-3333-3333-333333333333'$$,
  'anônimo lê perfil de professor publicado'
);

select is_empty(
  $$select id from public.profiles where id = '44444444-4444-4444-4444-444444444444'$$,
  'anônimo não lê perfil de professor não publicado'
);

select * from finish();
rollback;
