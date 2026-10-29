-- RLS e transições: cancelamento de solicitação pendente pelo responsável.

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(5);

-- Setup ---------------------------------------------------------------------------------------

insert into auth.users (id, email, raw_user_meta_data) values
  (
    '11111111-1111-1111-1111-111111111111',
    'cancel-guardian1@test.com',
    '{"role":"guardian","full_name":"Guardian One"}'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'cancel-guardian2@test.com',
    '{"role":"guardian","full_name":"Guardian Two"}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'cancel-teacher@test.com',
    '{"role":"teacher","full_name":"Teacher One"}'::jsonb
  );

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

insert into public.contact_requests (
  guardian_id, teacher_id, guardian_name, student_name, student_school_grade, reason
)
values (
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  'Guardian One',
  'Student One',
  'elementary_1',
  'Reforço de matemática'
);

-- Regra de duplicidade -------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select throws_ok(
  $$insert into public.contact_requests (
      teacher_id, guardian_name, student_name, student_school_grade, reason
    )
    values (
      '33333333-3333-3333-3333-333333333333',
      'Guardian One',
      'Student One',
      'elementary_1',
      'Outro pedido'
    )$$,
  '23505',
  null,
  'responsável não cria duas solicitações pendentes para o mesmo professor'
);

-- Outro responsável não cancela -----------------------------------------------------------------

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$update public.contact_requests
    set status = 'cancelled'
    where guardian_id = '11111111-1111-1111-1111-111111111111'
      and teacher_id = '33333333-3333-3333-3333-333333333333'
    returning id$$,
  'outro responsável não cancela a solicitação'
);

-- Professor não cancela -------------------------------------------------------------------------

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

select throws_ok(
  $$update public.contact_requests
    set status = 'cancelled'
    where guardian_id = '11111111-1111-1111-1111-111111111111'
      and teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'P0001',
  'contact_request_not_allowed',
  'professor não cancela a solicitação'
);

-- Responsável dono cancela e pode pedir de novo -------------------------------------------------

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select results_eq(
  $$update public.contact_requests
    set status = 'cancelled'
    where guardian_id = '11111111-1111-1111-1111-111111111111'
      and teacher_id = '33333333-3333-3333-3333-333333333333'
    returning status$$,
  array['cancelled'::public.contact_request_status],
  'responsável cancela a própria solicitação pendente'
);

select lives_ok(
  $$insert into public.contact_requests (
      teacher_id, guardian_name, student_name, student_school_grade, reason
    )
    values (
      '33333333-3333-3333-3333-333333333333',
      'Guardian One',
      'Student One',
      'elementary_1',
      'Novo pedido depois do cancelamento'
    )$$,
  'responsável pede de novo depois de cancelar'
);

select * from finish();
rollback;
