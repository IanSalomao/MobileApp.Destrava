-- Contas: aceite dos termos (LGPD), celular usado no botão do WhatsApp e bucket de fotos de perfil.

alter table public.profiles add column terms_accepted_at timestamptz;

comment on column public.profiles.terms_accepted_at is
  'Quando o usuário aceitou os Termos de Uso e a Política de Privacidade.';

-- O celular fica fora de profiles. Nome e foto de um perfil podem ser vistos por outras pessoas
-- (professor publicado, outra parte de uma solicitação), mas o número só depois do aceite (RF09).
create table public.contact_details (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  phone text check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  updated_at timestamptz not null default now()
);

comment on table public.contact_details is
  'Contato privado do usuário. A outra parte só lê depois de uma solicitação aceita.';
comment on column public.contact_details.phone is
  'Celular no formato E.164 (ex.: +5511999991234). É o número usado no botão do WhatsApp.';

alter table public.contact_details enable row level security;

create policy "Users can read their own contact details"
  on public.contact_details for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can update their own contact details"
  on public.contact_details for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- A linha é criada pelo handle_new_user; o app só altera o número.
revoke insert, update, delete on public.contact_details from anon, authenticated;
grant update (phone) on public.contact_details to authenticated;

create trigger contact_details_set_updated_at
  before update on public.contact_details
  for each row execute function public.set_updated_at();

-- Passa a gravar também o celular e o aceite dos termos. O app envia em options.data no signUp:
-- role, full_name, phone (E.164) e terms_accepted (boolean).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  requested_role text := metadata ->> 'role';
  requested_phone text := metadata ->> 'phone';
begin
  insert into public.profiles (id, role, full_name, terms_accepted_at)
  values (
    new.id,
    case when requested_role in ('guardian', 'teacher') then requested_role::public.user_role end,
    left(coalesce(metadata ->> 'full_name', metadata ->> 'name', ''), 120),
    case when metadata ->> 'terms_accepted' = 'true' then now() end
  );

  -- Número inválido não derruba o cadastro: fica nulo e o usuário corrige no perfil.
  insert into public.contact_details (user_id, phone)
  values (
    new.id,
    case when requested_phone ~ '^\+[1-9][0-9]{7,14}$' then requested_phone end
  );

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Contas criadas antes desta migração.
insert into public.contact_details (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

-- Funções auxiliares das políticas de RLS. Ficam no schema private, que a API não expõe: os papéis
-- do app conseguem executá-las dentro das políticas, mas não chamá-las como RPC. Por serem
-- security definer, leem as tabelas sem passar pelo RLS, o que evita recursão entre políticas que
-- se consultam (ex.: contact_requests -> profiles -> contact_requests).
create schema private;
grant usage on schema private to anon, authenticated;

create function private.is_guardian(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = p_user_id and role = 'guardian');
$$;

revoke execute on function private.is_guardian(uuid) from public;
grant execute on function private.is_guardian(uuid) to anon, authenticated;

-- Fotos de perfil (pais e professores). Bucket público: a foto do professor aparece para
-- visitantes. Cada usuário só grava na própria pasta: avatars/<user_id>/...
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png']);

create policy "Users can read their own avatar files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
