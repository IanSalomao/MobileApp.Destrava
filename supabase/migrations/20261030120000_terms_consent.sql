-- AUT-09: prova do consentimento (LGPD). A conta só nasce com o aceite dos Termos e da Política,
-- e o banco guarda qual versão foi aceita, quando e por qual papel (profiles.role).
-- Para responsável, também exige o consentimento específico para dados do aluno menor de idade.

alter table public.profiles
  add column terms_version text check (char_length(terms_version) between 1 and 40),
  add column minor_data_consent_at timestamptz;

comment on column public.profiles.terms_version is
  'Versão dos Termos de Uso e da Política de Privacidade exibida e aceita no cadastro (ex.: 2026-10).';
comment on column public.profiles.minor_data_consent_at is
  'Só para responsáveis: quando autorizou o tratamento dos dados básicos do aluno menor de idade.';

-- O app envia em options.data no signUp: role, full_name, phone (E.164), terms_accepted (boolean),
-- terms_version e, para responsável, minor_data_consent (boolean). Sem o aceite o cadastro é
-- recusado e a transação inteira volta atrás: nem o usuário em auth.users é criado.
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
  requested_terms_version text := nullif(btrim(metadata ->> 'terms_version'), '');
begin
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
