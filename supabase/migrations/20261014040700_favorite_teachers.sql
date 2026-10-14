-- Professores favoritos do responsável (coração nos cards da busca e no perfil do professor).

create table public.favorite_teachers (
  guardian_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (guardian_id, teacher_id)
);

create index favorite_teachers_teacher_id_idx on public.favorite_teachers (teacher_id);

alter table public.favorite_teachers enable row level security;

create policy "Guardians can read their own favorites"
  on public.favorite_teachers for select
  to authenticated
  using ((select auth.uid()) = guardian_id);

create policy "Guardians can favorite published teachers"
  on public.favorite_teachers for insert
  to authenticated
  with check (
    (select auth.uid()) = guardian_id
    and private.is_guardian(guardian_id)
    and private.is_published_teacher(teacher_id)
  );

create policy "Guardians can remove their own favorites"
  on public.favorite_teachers for delete
  to authenticated
  using ((select auth.uid()) = guardian_id);

revoke insert, update, delete on public.favorite_teachers from anon;
revoke update on public.favorite_teachers from authenticated;
