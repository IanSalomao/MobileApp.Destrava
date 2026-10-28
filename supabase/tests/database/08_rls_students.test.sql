-- RLS: alunos e matérias dos alunos.

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(15);

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
  );

insert into public.students (id, guardian_id, full_name, school_grade) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    'Student One',
    'elementary_1'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '22222222-2222-2222-2222-222222222222',
    'Student Two',
    'elementary_2'
  );

insert into public.student_subjects (student_id, subject_id) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'math'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'physics');

-- guardian1 ------------------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select isnt_empty(
  $$select id from public.students where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'$$,
  'responsável lê o próprio aluno'
);

select is_empty(
  $$select id from public.students where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'$$,
  'responsável não lê o aluno de outro responsável'
);

select lives_ok(
  $$insert into public.students (id, full_name, school_grade)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Student Three', 'elementary_3')$$,
  'responsável cria um aluno'
);

select results_eq(
  $$update public.students
    set full_name = 'Student One Updated'
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'
    returning full_name$$,
  array['Student One Updated'::text],
  'responsável edita o próprio aluno'
);

select is_empty(
  $$update public.students
    set full_name = 'Hacked'
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'
    returning id$$,
  'responsável não edita o aluno de outro responsável'
);

select results_eq(
  $$delete from public.students
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'
    returning id$$,
  array['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid],
  'responsável apaga o próprio aluno'
);

select is_empty(
  $$delete from public.students
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'
    returning id$$,
  'responsável não apaga o aluno de outro responsável'
);

-- guardian2 ------------------------------------------------------------------------------------

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select throws_ok(
  $$insert into public.students (guardian_id, full_name, school_grade)
    values ('11111111-1111-1111-1111-111111111111', 'Invasor', 'elementary_1')$$,
  '42501',
  null,
  'responsável não cria aluno para outro responsável'
);

-- teacher1 -------------------------------------------------------------------------------------

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

select is_empty(
  $$select id from public.students where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'$$,
  'professor não lê aluno do responsável'
);

select throws_ok(
  $$insert into public.students (full_name, school_grade)
    values ('Aluno do Professor', 'elementary_1')$$,
  '42501',
  null,
  'professor não cria aluno'
);

-- student_subjects -----------------------------------------------------------------------------

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select isnt_empty(
  $$select subject_id from public.student_subjects
    where student_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'$$,
  'responsável lê as matérias do próprio aluno'
);

select is_empty(
  $$select subject_id from public.student_subjects
    where student_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'$$,
  'responsável não lê as matérias do aluno de outro responsável'
);

select lives_ok(
  $$insert into public.student_subjects (student_id, subject_id)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'chemistry')$$,
  'responsável adiciona matéria ao próprio aluno'
);

select throws_ok(
  $$insert into public.student_subjects (student_id, subject_id)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'chemistry')$$,
  '42501',
  null,
  'responsável não adiciona matéria ao aluno de outro responsável'
);

select is_empty(
  $$delete from public.student_subjects
    where student_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'
      and subject_id = 'physics'
    returning subject_id$$,
  'responsável não remove matéria do aluno de outro responsável'
);

select * from finish();
rollback;
