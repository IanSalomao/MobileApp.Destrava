-- Professores: perfil público (RF01, RF03), matérias e idiomas, redes sociais (RF11),
-- verificação de identidade (RF02) e documentos no Storage.
--
-- O perfil só aparece para as famílias quando teachers.is_published = true, ou seja, verificação
-- aprovada e assinatura em teste ou ativa. Quem mantém essa coluna é o banco
-- (refresh_teacher_publication, na migração de assinaturas); o app nunca escreve nela.

create type public.verification_status as enum ('draft', 'pending_review', 'approved', 'rejected');
create type public.teacher_document_kind as enum ('identity', 'certificate');
create type public.social_network as enum (
  'instagram',
  'facebook',
  'linkedin',
  'tiktok',
  'youtube',
  'website'
);

-- Valida os dígitos verificadores do CPF (11 dígitos, sem máscara).
create function public.is_valid_cpf(cpf text)
returns boolean
language plpgsql
immutable
strict
set search_path = ''
as $$
declare
  total integer;
  digit integer;
begin
  if cpf !~ '^[0-9]{11}$' or cpf ~ '^(.)\1{10}$' then
    return false;
  end if;

  total := 0;
  for i in 1..9 loop
    total := total + substr(cpf, i, 1)::integer * (11 - i);
  end loop;
  digit := (total * 10) % 11 % 10;
  if digit <> substr(cpf, 10, 1)::integer then
    return false;
  end if;

  total := 0;
  for i in 1..10 loop
    total := total + substr(cpf, i, 1)::integer * (12 - i);
  end loop;
  digit := (total * 10) % 11 % 10;
  return digit = substr(cpf, 11, 1)::integer;
end;
$$;

-- Perfil profissional. Uma linha por professor, criada junto com o perfil (trigger mais abaixo).
-- Os campos começam nulos e são preenchidos nas etapas do cadastro profissional.
create table public.teachers (
  id uuid primary key references public.profiles (id) on delete cascade,
  bio text check (char_length(bio) <= 1000),
  hourly_rate_cents integer check (hourly_rate_cents > 0 and hourly_rate_cents <= 100000),
  tutoring_types public.tutoring_type[] not null default '{}',
  education_levels public.education_level[] not null default '{}',
  available_weekdays smallint[] not null default '{}'
    check (available_weekdays <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  available_periods public.day_period[] not null default '{}',
  postal_code text check (postal_code ~ '^[0-9]{8}$'),
  neighborhood text check (char_length(neighborhood) <= 80),
  city text check (char_length(city) <= 80),
  state text check (state ~ '^[A-Z]{2}$'),
  location extensions.geography(point, 4326),
  is_published boolean not null default false,
  rating_average numeric(3, 2),
  rating_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.teachers is 'Perfil profissional do professor. Público quando is_published.';
comment on column public.teachers.tutoring_types is 'Tipo de reforço: online, presencial ou os dois.';
comment on column public.teachers.available_weekdays is
  'Dias disponíveis: 0 = domingo ... 6 = sábado (mesma numeração do Date.getDay()).';
comment on column public.teachers.location is
  'Ponto aproximado da região de atendimento. O banco arredonda para uma grade de ~500 m.';
comment on column public.teachers.is_published is
  'Visível para as famílias: verificação aprovada e assinatura em teste ou ativa. Mantido pelo banco.';
comment on column public.teachers.rating_average is
  'Nota média (RF06), mantida pelo trigger de reviews. Nula enquanto não houver avaliações.';

-- Índice da busca por proximidade (RNF01). Parcial: a busca só olha professores publicados.
create index teachers_location_idx on public.teachers using gist (location) where is_published;

create trigger teachers_set_updated_at
  before update on public.teachers
  for each row execute function public.set_updated_at();

-- LGPD: não guardamos o endereço exato do professor. O ponto é arredondado para uma grade de
-- 0,005° (~500 m); a distância exibida ("2,4 km") continua útil.
create function public.snap_teacher_location()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.location is not null then
    new.location := extensions.st_snaptogrid(new.location::extensions.geometry, 0.005)::extensions.geography;
  end if;
  return new;
end;
$$;

create trigger teachers_snap_location
  before insert or update of location on public.teachers
  for each row execute function public.snap_teacher_location();

create table public.teacher_subjects (
  teacher_id uuid not null default auth.uid() references public.teachers (id) on delete cascade,
  subject_id text not null references public.subjects (id),
  primary key (teacher_id, subject_id)
);

create index teacher_subjects_subject_id_idx on public.teacher_subjects (subject_id);

create table public.teacher_languages (
  teacher_id uuid not null default auth.uid() references public.teachers (id) on delete cascade,
  language_id text not null references public.languages (id),
  primary key (teacher_id, language_id)
);

create index teacher_languages_language_id_idx on public.teacher_languages (language_id);

-- Redes sociais: só o professor e os pais com solicitação aceita leem (RF11). A política de
-- leitura para os pais fica na migração de solicitações de contato.
create table public.teacher_social_links (
  teacher_id uuid not null default auth.uid() references public.teachers (id) on delete cascade,
  network public.social_network not null,
  url text not null check (url ~ '^https://' and char_length(url) <= 300),
  primary key (teacher_id, network)
);

comment on table public.teacher_social_links is
  'Links de rede social do professor. Liberados ao pai só depois do aceite (RF11).';

-- Verificação de identidade (RF02). Guarda o CPF, por isso só o dono lê.
create table public.teacher_verifications (
  teacher_id uuid primary key references public.teachers (id) on delete cascade,
  cpf text unique check (public.is_valid_cpf(cpf)),
  status public.verification_status not null default 'draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  rejection_reason text check (char_length(rejection_reason) <= 500),
  updated_at timestamptz not null default now()
);

comment on table public.teacher_verifications is
  'Verificação de identidade do professor (RF02). Privada: só o próprio professor lê.';
comment on column public.teacher_verifications.status is
  'No MVP a verificação é simulada: submit_teacher_profile aprova na hora. pending_review e '
  'rejected ficam para quando houver um serviço de verificação de verdade.';

create trigger teacher_verifications_set_updated_at
  before update on public.teacher_verifications
  for each row execute function public.set_updated_at();

-- Documento com foto (RG/CNH) e certificados. O arquivo fica no bucket privado teacher-documents,
-- em <teacher_id>/...; aqui fica o registro de cada envio.
create table public.teacher_documents (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references public.teachers (id) on delete cascade,
  kind public.teacher_document_kind not null,
  storage_path text not null unique check (char_length(storage_path) <= 300),
  file_name text not null check (char_length(file_name) <= 200),
  created_at timestamptz not null default now(),
  check (split_part(storage_path, '/', 1) = teacher_id::text)
);

comment on column public.teacher_documents.storage_path is
  'Caminho do arquivo no bucket teacher-documents, sempre começando por <teacher_id>/.';

create index teacher_documents_teacher_id_idx on public.teacher_documents (teacher_id);

-- Cria o perfil profissional quando o perfil vira professor, no cadastro ou quando o papel for
-- escolhido depois (caso do Google OAuth).
create function public.handle_new_teacher()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.teachers (id) values (new.id) on conflict (id) do nothing;
  insert into public.teacher_verifications (teacher_id) values (new.id) on conflict (teacher_id) do nothing;
  return new;
end;
$$;

create trigger on_teacher_profile_created
  after insert or update of role on public.profiles
  for each row
  when (new.role = 'teacher')
  execute function public.handle_new_teacher();

revoke execute on function public.handle_new_teacher() from public, anon, authenticated;

-- Professores cadastrados antes desta migração.
insert into public.teachers (id)
select id from public.profiles where role = 'teacher'
on conflict (id) do nothing;

insert into public.teacher_verifications (teacher_id)
select id from public.teachers
on conflict (teacher_id) do nothing;

-- RLS ----------------------------------------------------------------------------------------

alter table public.teachers enable row level security;
alter table public.teacher_subjects enable row level security;
alter table public.teacher_languages enable row level security;
alter table public.teacher_social_links enable row level security;
alter table public.teacher_verifications enable row level security;
alter table public.teacher_documents enable row level security;

-- teachers: público quando publicado (RF03); o dono sempre lê e edita o próprio. A migração de
-- solicitações de contato amplia a leitura para quem já contatou o professor.
-- (Uma política de leitura por tabela, com as regras em OR, como pede o advisor do Supabase.)
create policy "Teachers are visible when published or to the owner"
  on public.teachers for select
  to anon, authenticated
  using (is_published or (select auth.uid()) = id);

create policy "Teachers can update their own teacher profile"
  on public.teachers for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Publicação e notas são do banco; o professor edita só os dados do perfil.
revoke insert, update, delete on public.teachers from anon, authenticated;
grant update (
  bio,
  hourly_rate_cents,
  tutoring_types,
  education_levels,
  available_weekdays,
  available_periods,
  postal_code,
  neighborhood,
  city,
  state,
  location
) on public.teachers to authenticated;

-- Auxiliar de RLS (veja private.is_guardian na migração de contas).
create function private.is_published_teacher(p_teacher_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.teachers where id = p_teacher_id and is_published);
$$;

revoke execute on function private.is_published_teacher(uuid) from public;
grant execute on function private.is_published_teacher(uuid) to anon, authenticated;

-- Nome e foto do professor ficam em profiles: liberados para todos quando ele está publicado.
drop policy "Users can read their own profile" on public.profiles;

create policy "Profiles are visible to the owner and for published teachers"
  on public.profiles for select
  to anon, authenticated
  using ((select auth.uid()) = id or private.is_published_teacher(id));

-- teacher_subjects / teacher_languages: visíveis junto com o professor (a subconsulta respeita
-- o RLS de teachers); só o dono adiciona e remove.
create policy "Teacher subjects are visible with the teacher"
  on public.teacher_subjects for select
  to anon, authenticated
  using (exists (select 1 from public.teachers t where t.id = teacher_subjects.teacher_id));

create policy "Teachers can add their own subjects"
  on public.teacher_subjects for insert
  to authenticated
  with check ((select auth.uid()) = teacher_id);

create policy "Teachers can remove their own subjects"
  on public.teacher_subjects for delete
  to authenticated
  using ((select auth.uid()) = teacher_id);

create policy "Teacher languages are visible with the teacher"
  on public.teacher_languages for select
  to anon, authenticated
  using (exists (select 1 from public.teachers t where t.id = teacher_languages.teacher_id));

create policy "Teachers can add their own languages"
  on public.teacher_languages for insert
  to authenticated
  with check ((select auth.uid()) = teacher_id);

create policy "Teachers can remove their own languages"
  on public.teacher_languages for delete
  to authenticated
  using ((select auth.uid()) = teacher_id);

revoke insert, update, delete on public.teacher_subjects, public.teacher_languages from anon;
revoke update on public.teacher_subjects, public.teacher_languages from authenticated;

-- teacher_social_links: o dono gerencia; leitura pelos pais vem com as solicitações aceitas.
create policy "Teachers can read their own social links"
  on public.teacher_social_links for select
  to authenticated
  using ((select auth.uid()) = teacher_id);

create policy "Teachers can add their own social links"
  on public.teacher_social_links for insert
  to authenticated
  with check ((select auth.uid()) = teacher_id);

create policy "Teachers can update their own social links"
  on public.teacher_social_links for update
  to authenticated
  using ((select auth.uid()) = teacher_id)
  with check ((select auth.uid()) = teacher_id);

create policy "Teachers can remove their own social links"
  on public.teacher_social_links for delete
  to authenticated
  using ((select auth.uid()) = teacher_id);

revoke insert, update, delete on public.teacher_social_links from anon;
revoke update on public.teacher_social_links from authenticated;
grant update (url) on public.teacher_social_links to authenticated;

-- teacher_verifications: só o dono lê. O CPF pode ser corrigido enquanto a verificação não foi
-- enviada (ou foi reprovada). O status muda só pelas funções do banco.
create policy "Teachers can read their own verification"
  on public.teacher_verifications for select
  to authenticated
  using ((select auth.uid()) = teacher_id);

create policy "Teachers can fill in their CPF before submitting"
  on public.teacher_verifications for update
  to authenticated
  using ((select auth.uid()) = teacher_id and status in ('draft', 'rejected'))
  with check ((select auth.uid()) = teacher_id);

revoke insert, update, delete on public.teacher_verifications from anon, authenticated;
grant update (cpf) on public.teacher_verifications to authenticated;

-- teacher_documents: só o dono. O documento de identidade fica travado depois do envio para
-- análise; certificados podem ser adicionados e removidos a qualquer momento.
create policy "Teachers can read their own documents"
  on public.teacher_documents for select
  to authenticated
  using ((select auth.uid()) = teacher_id);

create policy "Teachers can add their own documents"
  on public.teacher_documents for insert
  to authenticated
  with check (
    (select auth.uid()) = teacher_id
    and (
      kind = 'certificate'
      or exists (
        select 1 from public.teacher_verifications v
        where v.teacher_id = teacher_documents.teacher_id and v.status in ('draft', 'rejected')
      )
    )
  );

create policy "Teachers can remove their own documents"
  on public.teacher_documents for delete
  to authenticated
  using (
    (select auth.uid()) = teacher_id
    and (
      kind = 'certificate'
      or exists (
        select 1 from public.teacher_verifications v
        where v.teacher_id = teacher_documents.teacher_id and v.status in ('draft', 'rejected')
      )
    )
  );

revoke insert, update, delete on public.teacher_documents from anon, authenticated;
grant insert (kind, storage_path, file_name), delete on public.teacher_documents to authenticated;

-- Storage --------------------------------------------------------------------------------------

-- Documentos de identidade e certificados: bucket PRIVADO, lido só por URL assinada.
-- Caminho: teacher-documents/<teacher_id>/<arquivo>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'teacher-documents',
  'teacher-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
);

create policy "Teachers can read their own documents files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'teacher-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Teachers can upload their own documents files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'teacher-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.teachers t where t.id = (select auth.uid()))
  );

create policy "Teachers can delete their own documents files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'teacher-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Envio para análise ("Enviar para análise", etapa 3) ----------------------------------------

-- Confere se o cadastro profissional está completo e envia a verificação. No MVP a verificação é
-- simulada e aprova na hora; com um serviço real, o status passaria a 'pending_review' aqui.
-- Erro 'teacher_profile_incomplete' traz no detail a lista do que falta, separada por vírgula.
create function public.submit_teacher_profile()
returns public.verification_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  teacher public.teachers;
  verification public.teacher_verifications;
  missing text[] := array[]::text[];
begin
  select * into teacher from public.teachers where id = current_user_id;
  if not found then
    raise exception 'not_a_teacher' using errcode = '42501';
  end if;

  select * into verification
  from public.teacher_verifications
  where teacher_id = current_user_id
  for update;

  if verification.status not in ('draft', 'rejected') then
    raise exception 'verification_already_submitted';
  end if;

  if (select btrim(full_name) from public.profiles where id = current_user_id) = '' then
    missing := missing || 'full_name'::text;
  end if;
  if verification.cpf is null then
    missing := missing || 'cpf'::text;
  end if;
  if not exists (
    select 1 from public.teacher_documents
    where teacher_id = current_user_id and kind = 'identity'
  ) then
    missing := missing || 'identity_document'::text;
  end if;
  if teacher.city is null or teacher.state is null or teacher.location is null then
    missing := missing || 'location'::text;
  end if;
  if not exists (select 1 from public.teacher_subjects where teacher_id = current_user_id) then
    missing := missing || 'subjects'::text;
  end if;
  if not exists (select 1 from public.teacher_languages where teacher_id = current_user_id) then
    missing := missing || 'languages'::text;
  end if;
  if cardinality(teacher.tutoring_types) = 0 then
    missing := missing || 'tutoring_types'::text;
  end if;
  if teacher.hourly_rate_cents is null then
    missing := missing || 'hourly_rate'::text;
  end if;
  if cardinality(teacher.available_weekdays) = 0 or cardinality(teacher.available_periods) = 0 then
    missing := missing || 'availability'::text;
  end if;

  if cardinality(missing) > 0 then
    raise exception 'teacher_profile_incomplete' using detail = array_to_string(missing, ',');
  end if;

  update public.teacher_verifications
  set status = 'approved', submitted_at = now(), reviewed_at = now(), rejection_reason = null
  where teacher_id = current_user_id;

  return 'approved'::public.verification_status;
end;
$$;

revoke execute on function public.submit_teacher_profile() from public, anon;
grant execute on function public.submit_teacher_profile() to authenticated;
