-- Alunos (filhos) do responsável: etapa 2 do cadastro do responsável ("Configure seu perfil") e
-- seção "Aluno" do perfil. Um responsável pode ter mais de um aluno.
--
-- LGPD: são dados de menores, então só o próprio responsável lê esta tabela. O professor vê apenas
-- a cópia enviada no formulário de contato (contact_requests).

create table public.students (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 1 and 120),
  school_grade public.school_grade not null,
  learning_goal text check (char_length(learning_goal) <= 500),
  preferred_tutoring_type public.tutoring_type,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.students is 'Alunos do responsável. Privado: só o responsável lê (LGPD).';
comment on column public.students.learning_goal is 'Objetivo principal ("Reforço em frações...").';
comment on column public.students.preferred_tutoring_type is
  'Preferência de tipo de reforço (ex.: "Aulas online"). Nulo = sem preferência.';

create index students_guardian_id_idx on public.students (guardian_id);

create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

-- Matérias de interesse do aluno.
create table public.student_subjects (
  student_id uuid not null references public.students (id) on delete cascade,
  subject_id text not null references public.subjects (id),
  primary key (student_id, subject_id)
);

create index student_subjects_subject_id_idx on public.student_subjects (subject_id);

alter table public.students enable row level security;
alter table public.student_subjects enable row level security;

create policy "Guardians can read their own students"
  on public.students for select
  to authenticated
  using ((select auth.uid()) = guardian_id);

create policy "Guardians can add students"
  on public.students for insert
  to authenticated
  with check ((select auth.uid()) = guardian_id and private.is_guardian(guardian_id));

create policy "Guardians can update their own students"
  on public.students for update
  to authenticated
  using ((select auth.uid()) = guardian_id)
  with check ((select auth.uid()) = guardian_id);

create policy "Guardians can remove their own students"
  on public.students for delete
  to authenticated
  using ((select auth.uid()) = guardian_id);

revoke insert, update, delete on public.students from anon;
revoke update on public.students from authenticated;
grant update (full_name, school_grade, learning_goal, preferred_tutoring_type)
  on public.students to authenticated;

-- A subconsulta respeita o RLS de students: só passa se o aluno for do usuário.
create policy "Guardians can read their students' subjects"
  on public.student_subjects for select
  to authenticated
  using (exists (select 1 from public.students s where s.id = student_subjects.student_id));

create policy "Guardians can add their students' subjects"
  on public.student_subjects for insert
  to authenticated
  with check (exists (select 1 from public.students s where s.id = student_subjects.student_id));

create policy "Guardians can remove their students' subjects"
  on public.student_subjects for delete
  to authenticated
  using (exists (select 1 from public.students s where s.id = student_subjects.student_id));

revoke insert, update, delete on public.student_subjects from anon;
revoke update on public.student_subjects from authenticated;
