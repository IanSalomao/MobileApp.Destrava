-- Login com Google (RNF06) e escolha de papel.
--
-- Quem entra pelo Google não passa pelo formulário de cadastro: o Google não informa papel, celular
-- nem o aceite dos Termos. Até aqui o trigger handle_new_user recusava esse cadastro
-- (terms_not_accepted). Agora a conta OAuth nasce com o perfil sem papel e sem aceite, e o app manda
-- o usuário para a escolha de papel (/choose-role), que chama complete_role_choice para registrar
-- papel, aceite, consentimento de dados do menor (responsável) e celular, tudo de uma vez.
--
-- O cadastro por e-mail e senha continua exatamente igual: aceite obrigatório nos metadados.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  -- Provedor do cadastro: 'email' no formulário do app; 'google' (ou outro) no OAuth.
  is_oauth boolean := coalesce(new.raw_app_meta_data ->> 'provider', 'email') <> 'email';
  requested_role text := metadata ->> 'role';
  requested_phone text := metadata ->> 'phone';
  requested_terms_version text := nullif(btrim(metadata ->> 'terms_version'), '');
  oauth_avatar text := coalesce(metadata ->> 'avatar_url', metadata ->> 'picture');
begin
  if is_oauth then
    -- Sem papel e sem aceite: complete_role_choice registra os dois na escolha de papel.
    insert into public.profiles (id, role, full_name, avatar_url)
    values (
      new.id,
      null,
      left(coalesce(metadata ->> 'full_name', metadata ->> 'name', ''), 120),
      case when oauth_avatar ~ '^https://' then left(oauth_avatar, 500) end
    );

    insert into public.contact_details (user_id, phone) values (new.id, null);
    return new;
  end if;

  if metadata ->> 'terms_accepted' is distinct from 'true' or requested_terms_version is null then
    raise exception 'terms_not_accepted'
      using errcode = 'check_violation',
            hint = 'Envie terms_accepted = true e terms_version em raw_user_meta_data.';
  end if;

  if requested_role = 'guardian' and metadata ->> 'minor_data_consent' is distinct from 'true' then
    raise exception 'minor_data_consent_required'
      using errcode = 'check_violation',
            hint = 'Responsável precisa enviar minor_data_consent = true.';
  end if;

  insert into public.profiles (id, role, full_name, terms_accepted_at, terms_version, minor_data_consent_at)
  values (
    new.id,
    case when requested_role in ('guardian', 'teacher') then requested_role::public.user_role end,
    left(coalesce(metadata ->> 'full_name', metadata ->> 'name', ''), 120),
    now(),
    left(requested_terms_version, 40),
    case when requested_role = 'guardian' then now() end
  );

  insert into public.contact_details (user_id, phone)
  values (
    new.id,
    case when requested_phone ~ '^\+[1-9][0-9]{7,14}$' then requested_phone end
  );

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Escolha de papel de quem entrou pelo Google. Só vale uma vez (perfil ainda sem papel): depois disso
-- o papel não muda pelo app. Para professor, o trigger on_teacher_profile_created cria teachers e
-- teacher_verifications quando o papel é gravado.
create function public.complete_role_choice(
  p_role public.user_role,
  p_terms_version text,
  p_minor_data_consent boolean default false,
  p_phone text default null
)
returns public.user_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  v_terms_version text := nullif(btrim(p_terms_version), '');
begin
  if current_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if p_role is null then
    raise exception 'role_required';
  end if;

  if v_terms_version is null then
    raise exception 'terms_not_accepted';
  end if;

  if p_role = 'guardian' and not coalesce(p_minor_data_consent, false) then
    raise exception 'minor_data_consent_required';
  end if;

  if p_phone is not null and p_phone !~ '^\+[1-9][0-9]{7,14}$' then
    raise exception 'invalid_phone';
  end if;

  update public.profiles
  set role = p_role,
    terms_accepted_at = now(),
    terms_version = left(v_terms_version, 40),
    minor_data_consent_at = case when p_role = 'guardian' then now() end
  where id = current_user_id and role is null;

  if not found then
    raise exception 'role_already_chosen';
  end if;

  if p_phone is not null then
    insert into public.contact_details (user_id, phone)
    values (current_user_id, p_phone)
    on conflict (user_id) do update set phone = excluded.phone;
  end if;

  return p_role;
end;
$$;

comment on function public.complete_role_choice(public.user_role, text, boolean, text) is
  'Escolha de papel, aceite dos Termos e celular de quem entrou pelo Google (RNF06). Uma vez só.';

revoke execute on function public.complete_role_choice(public.user_role, text, boolean, text)
  from public, anon;
grant execute on function public.complete_role_choice(public.user_role, text, boolean, text)
  to authenticated;
