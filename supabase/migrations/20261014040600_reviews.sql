-- Avaliações (RF12) e nota média do professor (RF06).
--
-- A aula acontece fora do app, então quem pode avaliar é o responsável com uma solicitação aceita
-- por aquele professor. Uma avaliação por par responsável/professor, que pode ser editada.

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  guardian_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  reviewer_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guardian_id, teacher_id)
);

comment on column public.reviews.reviewer_name is
  'Nome exibido na avaliação ("Camila S."), gerado pelo banco a partir do perfil. Evita expor o '
  'nome completo do responsável para visitantes.';

create index reviews_teacher_id_created_at_idx on public.reviews (teacher_id, created_at desc);

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- Primeiro nome + inicial do último sobrenome: "Camila Souza" -> "Camila S.".
create function public.set_reviewer_name()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  name_parts text[];
begin
  select regexp_split_to_array(coalesce(nullif(btrim(p.full_name), ''), 'Responsável'), '\s+')
  into name_parts
  from public.profiles p
  where p.id = new.guardian_id;

  new.reviewer_name := coalesce(name_parts[1], 'Responsável')
    || case
      when cardinality(name_parts) > 1 then ' ' || left(name_parts[cardinality(name_parts)], 1) || '.'
      else ''
    end;
  return new;
end;
$$;

create trigger reviews_set_reviewer_name
  before insert on public.reviews
  for each row execute function public.set_reviewer_name();

-- RF06: nota média e total de avaliações ficam em teachers, recalculados a cada mudança.
create function public.refresh_teacher_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_teacher_id uuid := case when tg_op = 'DELETE' then old.teacher_id else new.teacher_id end;
begin
  update public.teachers t
  set rating_count = stats.total, rating_average = stats.average
  from (
    select count(*)::integer as total, round(avg(r.rating), 2) as average
    from public.reviews r
    where r.teacher_id = affected_teacher_id
  ) stats
  where t.id = affected_teacher_id;

  return null;
end;
$$;

create trigger reviews_refresh_teacher_rating
  after insert or update of rating or delete on public.reviews
  for each row execute function public.refresh_teacher_rating();

revoke execute on function public.refresh_teacher_rating() from public, anon, authenticated;

-- RLS ------------------------------------------------------------------------------------------

alter table public.reviews enable row level security;

-- Públicas para professores publicados; quem escreveu e quem recebeu sempre leem.
create policy "Reviews visible for published teachers and to participants"
  on public.reviews for select
  to anon, authenticated
  using (
    private.is_published_teacher(teacher_id)
    or (select auth.uid()) in (guardian_id, teacher_id)
  );

create policy "Guardians with an accepted request can review the teacher"
  on public.reviews for insert
  to authenticated
  with check (
    (select auth.uid()) = guardian_id
    and exists (
      select 1 from public.contact_requests r
      where r.guardian_id = reviews.guardian_id
        and r.teacher_id = reviews.teacher_id
        and r.status = 'accepted'
    )
  );

create policy "Guardians can update their own reviews"
  on public.reviews for update
  to authenticated
  using ((select auth.uid()) = guardian_id)
  with check ((select auth.uid()) = guardian_id);

create policy "Guardians can delete their own reviews"
  on public.reviews for delete
  to authenticated
  using ((select auth.uid()) = guardian_id);

revoke insert, update, delete on public.reviews from anon, authenticated;
grant insert (teacher_id, rating, comment) on public.reviews to authenticated;
grant update (rating, comment) on public.reviews to authenticated;
grant delete on public.reviews to authenticated;
