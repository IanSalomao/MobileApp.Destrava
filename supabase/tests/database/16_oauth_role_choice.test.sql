-- RNF06: conta criada pelo Google nasce sem papel e sem aceite; a escolha de papel registra os dois.

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(14);

-- Cadastro pelo Google ---------------------------------------------------------------------------------

insert into auth.users (id, email, raw_app_meta_data, raw_user_meta_data) values
  (
    'cccccccc-0000-0000-0000-000000000001', 'google-prof@test.com',
    '{"provider":"google","providers":["google"]}'::jsonb,
    '{"full_name":"Prof Google","picture":"https://lh3.googleusercontent.com/a/foto"}'::jsonb
  ),
  (
    'cccccccc-0000-0000-0000-000000000002', 'google-resp@test.com',
    '{"provider":"google","providers":["google"]}'::jsonb,
    '{"name":"Resp Google"}'::jsonb
  );

select results_eq(
  $$select role is null, full_name, terms_accepted_at is null, terms_version is null, avatar_url
    from public.profiles where id = 'cccccccc-0000-0000-0000-000000000001'$$,
  $$values (true, 'Prof Google', true, true, 'https://lh3.googleusercontent.com/a/foto')$$,
  'conta Google nasce sem papel e sem aceite, com nome e foto do Google'
);

select is(
  (select count(*) from public.contact_details where user_id = 'cccccccc-0000-0000-0000-000000000002'),
  1::bigint,
  'conta Google também ganha contact_details (sem celular)'
);

select throws_ok(
  $$insert into auth.users (id, email, raw_app_meta_data, raw_user_meta_data) values (
    'cccccccc-0000-0000-0000-000000000009', 'email-sem-aceite@test.com',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"teacher","full_name":"Sem Aceite"}'::jsonb)$$,
  '23514', 'terms_not_accepted',
  'cadastro por e-mail continua exigindo o aceite'
);

-- Escolha de papel -------------------------------------------------------------------------------------

select ok(
  not has_function_privilege(
    'anon', 'public.complete_role_choice(public.user_role, text, boolean, text)', 'EXECUTE'
  ),
  'visitante não executa a escolha de papel'
);

set local role authenticated;
set local request.jwt.claim.sub = 'cccccccc-0000-0000-0000-000000000002';

select throws_ok(
  $$select public.complete_role_choice('guardian', '2026-10', false, null)$$,
  'minor_data_consent_required',
  'responsável precisa do consentimento sobre os dados do menor'
);

select throws_ok(
  $$select public.complete_role_choice('guardian', '  ', true, null)$$,
  'terms_not_accepted',
  'sem a versão dos termos não há aceite'
);

select throws_ok(
  $$select public.complete_role_choice('guardian', '2026-10', true, '11999990000')$$,
  'invalid_phone',
  'celular precisa estar em E.164'
);

select is(
  public.complete_role_choice('guardian', '2026-10', true, '+5511999990000'),
  'guardian'::public.user_role,
  'responsável escolhe o papel'
);

select throws_ok(
  $$select public.complete_role_choice('teacher', '2026-10', false, null)$$,
  'role_already_chosen',
  'o papel não muda depois de escolhido'
);

reset role;

select results_eq(
  $$select p.role::text, p.terms_version, p.terms_accepted_at is not null,
           p.minor_data_consent_at is not null, c.phone
    from public.profiles p join public.contact_details c on c.user_id = p.id
    where p.id = 'cccccccc-0000-0000-0000-000000000002'$$,
  $$values ('guardian', '2026-10', true, true, '+5511999990000')$$,
  'grava papel, aceite, consentimento e celular'
);

set local role authenticated;
set local request.jwt.claim.sub = 'cccccccc-0000-0000-0000-000000000001';

select is(
  public.complete_role_choice('teacher', '2026-10', false, null),
  'teacher'::public.user_role,
  'professor escolhe o papel sem celular'
);

reset role;

select results_eq(
  $$select role::text, minor_data_consent_at is null from public.profiles
    where id = 'cccccccc-0000-0000-0000-000000000001'$$,
  $$values ('teacher', true)$$,
  'professor não grava consentimento de menor'
);

select is(
  (select count(*) from public.teachers where id = 'cccccccc-0000-0000-0000-000000000001'),
  1::bigint,
  'escolher professor cria o perfil profissional'
);

select is(
  (select status::text from public.teacher_verifications
   where teacher_id = 'cccccccc-0000-0000-0000-000000000001'),
  'draft',
  'e a verificação em rascunho'
);

select * from finish();

rollback;
