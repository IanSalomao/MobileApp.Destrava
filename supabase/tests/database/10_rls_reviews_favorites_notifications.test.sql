-- RLS: avaliações, favoritos e notificações.

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(18);

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

-- teacher1 publicado.
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

-- teacher2 aprovado, sem assinatura -> não publicado.
update public.teacher_verifications
set status = 'approved'
where teacher_id = '44444444-4444-4444-4444-444444444444';

-- Solicitação aceita entre guardian1 e teacher1.
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

-- Review de teacher2 (não publicado) para o teste negativo do anônimo.
insert into public.reviews (teacher_id, guardian_id, rating, comment, reviewer_name)
values (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  5,
  'Review de professor não publicado',
  'Guardian O.'
);

-- Notificações de guardian1 e guardian2.
insert into public.notifications (id, user_id, type) values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '11111111-1111-1111-1111-111111111111',
    'review_received'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    '22222222-2222-2222-2222-222222222222',
    'review_received'
  );

-- Reviews --------------------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select lives_ok(
  $$insert into public.reviews (teacher_id, rating, comment)
    values ('33333333-3333-3333-3333-333333333333', 5, 'Excelente professora')$$,
  'responsável com solicitação aceita avalia o professor'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select throws_ok(
  $$insert into public.reviews (teacher_id, rating, comment)
    values ('33333333-3333-3333-3333-333333333333', 1, 'Sem aula')$$,
  '42501',
  null,
  'responsável sem solicitação aceita não avalia'
);

reset role;
set local role anon;
reset request.jwt.claim.sub;

select isnt_empty(
  $$select id from public.reviews where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'anônimo lê avaliações de professor publicado'
);

select is_empty(
  $$select id from public.reviews where teacher_id = '44444444-4444-4444-4444-444444444444'$$,
  'anônimo não lê avaliações de professor não publicado'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$update public.reviews
    set rating = 1
    where guardian_id = '11111111-1111-1111-1111-111111111111'
      and teacher_id = '33333333-3333-3333-3333-333333333333'
    returning id$$,
  'outro responsável não edita a avaliação'
);

select is_empty(
  $$delete from public.reviews
    where guardian_id = '11111111-1111-1111-1111-111111111111'
      and teacher_id = '33333333-3333-3333-3333-333333333333'
    returning id$$,
  'outro responsável não apaga a avaliação'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select results_eq(
  $$update public.reviews
    set rating = 4
    where guardian_id = '11111111-1111-1111-1111-111111111111'
      and teacher_id = '33333333-3333-3333-3333-333333333333'
    returning rating$$,
  array[4::smallint],
  'responsável edita a própria avaliação'
);

-- Favoritos ------------------------------------------------------------------------------------

select lives_ok(
  $$insert into public.favorite_teachers (teacher_id)
    values ('33333333-3333-3333-3333-333333333333')$$,
  'responsável favorita professor publicado'
);

select throws_ok(
  $$insert into public.favorite_teachers (teacher_id)
    values ('44444444-4444-4444-4444-444444444444')$$,
  '42501',
  null,
  'responsável não favorita professor não publicado'
);

select isnt_empty(
  $$select teacher_id from public.favorite_teachers
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'responsável lê o próprio favorito'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$select teacher_id from public.favorite_teachers
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'outro responsável não lê o favorito'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select results_eq(
  $$delete from public.favorite_teachers
    where teacher_id = '33333333-3333-3333-3333-333333333333'
    returning teacher_id$$,
  array['33333333-3333-3333-3333-333333333333'::uuid],
  'responsável remove o próprio favorito'
);

-- Notificações ---------------------------------------------------------------------------------

select isnt_empty(
  $$select id from public.notifications
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'$$,
  'usuário lê a própria notificação'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$select id from public.notifications
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'$$,
  'outro usuário não lê a notificação'
);

select is_empty(
  $$update public.notifications
    set read_at = now()
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'
    returning id$$,
  'outro usuário não marca a notificação como lida'
);

select is_empty(
  $$delete from public.notifications
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'
    returning id$$,
  'outro usuário não apaga a notificação'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select results_eq(
  $$update public.notifications
    set read_at = now()
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'
    returning id$$,
  array['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid],
  'usuário marca a própria notificação como lida'
);

select results_eq(
  $$delete from public.notifications
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'
    returning id$$,
  array['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid],
  'usuário apaga a própria notificação'
);

select * from finish();
rollback;
