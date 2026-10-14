-- Perfis de usuário: uma linha por conta do Supabase Auth, criada automaticamente no cadastro.

create type public.user_role as enum ('guardian', 'teacher');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role,
  full_name text not null default '' check (char_length(full_name) <= 120),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Dados básicos de cada usuário (pai/responsável ou professor).';
comment on column public.profiles.role is
  'Definido no cadastro. Fica nulo quando o provedor não informa (ex.: Google OAuth) até o usuário escolher.';

-- RLS: cada usuário só lê e edita o próprio perfil.
alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- O cliente não cria nem apaga perfis (isso é feito pelo trigger e pelo cascade do auth.users)
-- e só pode alterar as colunas liberadas abaixo. O papel não muda pelo app.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- Mantém updated_at em dia.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o perfil quando um usuário se cadastra. O app envia role e full_name em options.data no signUp.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    case when requested_role in ('guardian', 'teacher') then requested_role::public.user_role end,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 120)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
