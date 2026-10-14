-- Catálogo: extensões, tipos compartilhados e listas de referência (matérias e idiomas).

-- PostGIS para a busca por proximidade (RF04) e unaccent para a busca por texto sem acento.
create extension if not exists postgis with schema extensions;
create extension if not exists unaccent with schema extensions;

-- Tipo de reforço (RF05). No protótipo aparece como "Tipo de aula": online ou presencial.
create type public.tutoring_type as enum ('online', 'in_person');

-- Etapas de ensino que o professor atende: anos iniciais (1º ao 5º), Fundamental II (6º ao 9º)
-- e Ensino Médio.
create type public.education_level as enum ('elementary_early', 'elementary_late', 'high_school');

-- Ano escolar do aluno.
create type public.school_grade as enum (
  'elementary_1',
  'elementary_2',
  'elementary_3',
  'elementary_4',
  'elementary_5',
  'elementary_6',
  'elementary_7',
  'elementary_8',
  'elementary_9',
  'high_school_1',
  'high_school_2',
  'high_school_3'
);

-- Períodos da disponibilidade do professor: manhã, tarde e noite.
create type public.day_period as enum ('morning', 'afternoon', 'evening');

-- Matérias e idiomas ficam em tabelas (e não em enum) porque a lista deve crescer.
-- O id é um slug estável que o app usa nas chaves e nos filtros.
create table public.subjects (
  id text primary key check (id ~ '^[a-z][a-z0-9_]*$'),
  name text not null unique,
  sort_order smallint not null default 0
);

comment on table public.subjects is 'Matérias oferecidas pelos professores e buscadas pelos responsáveis.';

create table public.languages (
  id text primary key check (id ~ '^[a-z]{2}$'),
  name text not null unique,
  sort_order smallint not null default 0
);

comment on table public.languages is 'Idiomas em que o professor dá aula.';
comment on column public.languages.id is 'Código ISO 639-1 (ex.: pt, en, es).';

insert into public.subjects (id, name, sort_order) values
  ('math', 'Matemática', 1),
  ('portuguese', 'Português', 2),
  ('physics', 'Física', 3),
  ('chemistry', 'Química', 4),
  ('biology', 'Biologia', 5),
  ('history', 'História', 6),
  ('english', 'Inglês', 7);

insert into public.languages (id, name, sort_order) values
  ('pt', 'Português', 1),
  ('en', 'Inglês', 2),
  ('es', 'Espanhol', 3);

-- RLS: leitura pública (inclusive visitante anônimo); escrita só por migração.
alter table public.subjects enable row level security;
alter table public.languages enable row level security;

create policy "Anyone can read subjects"
  on public.subjects for select
  to anon, authenticated
  using (true);

create policy "Anyone can read languages"
  on public.languages for select
  to anon, authenticated
  using (true);

revoke insert, update, delete on public.subjects, public.languages from anon, authenticated;

-- Normaliza texto para busca: minúsculas e sem acento ("Matemática" -> "matematica").
-- O dicionário vai qualificado porque a forma de um argumento do unaccent depende do search_path.
create function public.normalize_search_text(value text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, value));
$$;
