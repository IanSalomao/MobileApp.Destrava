-- RLS: publicação do professor (verificação aprovada + assinatura trial/ativa).

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(13);

-- Setup ---------------------------------------------------------------------------------------

insert into auth.users (id, email, raw_user_meta_data) values
  (
    '11111111-1111-1111-1111-111111111111',
    'guardian1@test.com',
    '{"role":"guardian","full_name":"Guardian One","phone":"+5511999990001"}'::jsonb
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
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'teacher3@test.com',
    '{"role":"teacher","full_name":"Teacher Three","phone":"+5511999990005"}'::jsonb
  );

-- teacher1: verificação aprovada + trial -> publicado.
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

-- teacher2: verificação aprovada, sem assinatura -> não publicado.
update public.teacher_verifications
set status = 'approved'
where teacher_id = '44444444-4444-4444-4444-444444444444';

-- teacher3: assinatura em trial, verificação draft -> não publicado.
insert into public.subscriptions (
  teacher_id, plan_id, status, current_period_start, current_period_end
)
values (
  '55555555-5555-5555-5555-555555555555',
  'teacher_launch',
  'trialing',
  now(),
  now() + interval '7 days'
);

-- Matérias dos professores.
insert into public.teacher_subjects (teacher_id, subject_id) values
  ('33333333-3333-3333-3333-333333333333', 'math'),
  ('44444444-4444-4444-4444-444444444444', 'physics');

-- Solicitação aceita para testar o acesso mesmo depois da despublicação.
insert into public.contact_requests (
  guardian_id,
  teacher_id,
  guardian_name,
  student_name,
  student_school_grade,
  reason,
  status,
  responded_at
)
values (
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  'Guardian One',
  'Student One',
  'elementary_1',
  'Reforço de matemática',
  'accepted',
  now()
);

-- Anônimo, antes da expiração ----------------------------------------------------------------

set local role anon;
reset request.jwt.claim.sub;

select isnt_empty(
  $$select id from public.teachers where id = '33333333-3333-3333-3333-333333333333'$$,
  'anônimo vê professor verificado com assinatura em trial'
);

select is_empty(
  $$select id from public.teachers where id = '44444444-4444-4444-4444-444444444444'$$,
  'anônimo não vê professor sem assinatura'
);

select is_empty(
  $$select id from public.teachers where id = '55555555-5555-5555-5555-555555555555'$$,
  'anônimo não vê professor com verificação pendente'
);

select isnt_empty(
  $$select id from public.profiles where id = '33333333-3333-3333-3333-333333333333'$$,
  'anônimo vê o perfil do professor publicado'
);

select is_empty(
  $$select id from public.profiles where id = '44444444-4444-4444-4444-444444444444'$$,
  'anônimo não vê o perfil do professor não publicado'
);

select isnt_empty(
  $$select teacher_id from public.teacher_subjects
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'anônimo vê as matérias do professor publicado'
);

select is_empty(
  $$select teacher_id from public.teacher_subjects
    where teacher_id = '44444444-4444-4444-4444-444444444444'$$,
  'anônimo não vê as matérias do professor não publicado'
);

-- Dono enxerga o próprio perfil mesmo sem publicação ------------------------------------------

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';

select isnt_empty(
  $$select id from public.teachers where id = '44444444-4444-4444-4444-444444444444'$$,
  'professor vê o próprio perfil mesmo não publicado'
);

-- Expira a assinatura do teacher1 --------------------------------------------------------------

reset role;

update public.subscriptions
set status = 'expired'
where teacher_id = '33333333-3333-3333-3333-333333333333';

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select isnt_empty(
  $$select id from public.teachers where id = '33333333-3333-3333-3333-333333333333'$$,
  'responsável com solicitação aceita continua vendo o professor despublicado'
);

reset role;
set local role anon;
reset request.jwt.claim.sub;

select is_empty(
  $$select id from public.teachers where id = '33333333-3333-3333-3333-333333333333'$$,
  'anônimo deixa de ver o professor depois da expiração'
);

-- Colunas que o professor pode e não pode alterar ----------------------------------------------

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

select results_eq(
  $$update public.teachers
    set bio = 'Aulas de matemática'
    where id = '33333333-3333-3333-3333-333333333333'
    returning bio$$,
  array['Aulas de matemática'::text],
  'professor edita o próprio bio'
);

select throws_ok(
  $$update public.teachers
    set is_published = true
    where id = '33333333-3333-3333-3333-333333333333'$$,
  '42501',
  null,
  'professor não altera is_published'
);

select throws_ok(
  $$update public.teachers
    set rating_average = 5
    where id = '33333333-3333-3333-3333-333333333333'$$,
  '42501',
  null,
  'professor não altera a nota média'
);

select * from finish();
rollback;
