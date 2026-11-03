-- AUT-09: a conta só é criada com o aceite dos Termos e da Política (LGPD).

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(12);

-- Recusas: o cadastro falha e nada é gravado -------------------------------------------------------

select throws_ok(
  $$insert into auth.users (id, email, raw_user_meta_data) values (
    'aaaaaaaa-0000-0000-0000-000000000001', 'sem-aceite@test.com',
    '{"role":"teacher","full_name":"Sem Aceite"}'::jsonb)$$,
  '23514', 'terms_not_accepted',
  'sem terms_accepted a conta não é criada'
);

select throws_ok(
  $$insert into auth.users (id, email, raw_user_meta_data) values (
    'aaaaaaaa-0000-0000-0000-000000000002', 'aceite-falso@test.com',
    '{"role":"teacher","full_name":"Aceite Falso","terms_accepted":"false","terms_version":"2026-10"}'::jsonb)$$,
  '23514', 'terms_not_accepted',
  'terms_accepted diferente de true não cria a conta'
);

select throws_ok(
  $$insert into auth.users (id, email, raw_user_meta_data) values (
    'aaaaaaaa-0000-0000-0000-000000000003', 'sem-versao@test.com',
    '{"role":"teacher","full_name":"Sem Versao","terms_accepted":"true"}'::jsonb)$$,
  '23514', 'terms_not_accepted',
  'aceite sem a versão do documento não cria a conta'
);

select throws_ok(
  $$insert into auth.users (id, email, raw_user_meta_data) values (
    'aaaaaaaa-0000-0000-0000-000000000004', 'versao-vazia@test.com',
    '{"role":"teacher","full_name":"Versao Vazia","terms_accepted":"true","terms_version":"  "}'::jsonb)$$,
  '23514', 'terms_not_accepted',
  'versão em branco não cria a conta'
);

select throws_ok(
  $$insert into auth.users (id, email, raw_user_meta_data) values (
    'aaaaaaaa-0000-0000-0000-000000000005', 'resp-sem-menor@test.com',
    '{"role":"guardian","full_name":"Resp Sem Menor","terms_accepted":"true","terms_version":"2026-10"}'::jsonb)$$,
  '23514', 'minor_data_consent_required',
  'responsável sem o consentimento sobre dados do menor não cria a conta'
);

select is(
  (select count(*) from auth.users where email like '%@test.com'),
  0::bigint,
  'nenhuma das tentativas recusadas deixou usuário em auth.users'
);

-- Aceites válidos: a prova fica gravada ---------------------------------------------------------------

insert into auth.users (id, email, raw_user_meta_data) values
  (
    'bbbbbbbb-0000-0000-0000-000000000001', 'professor@test.com',
    '{"role":"teacher","full_name":"Professor","terms_accepted":"true","terms_version":"2026-10"}'::jsonb
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000002', 'responsavel@test.com',
    '{"role":"guardian","full_name":"Responsavel","terms_accepted":"true","terms_version":"2026-10","minor_data_consent":"true"}'::jsonb
  );

select results_eq(
  $$select role::text, terms_version, terms_accepted_at is not null, minor_data_consent_at is null
    from public.profiles where id = 'bbbbbbbb-0000-0000-0000-000000000001'$$,
  $$values ('teacher', '2026-10', true, true)$$,
  'professor: grava papel, versão e data do aceite, sem consentimento de menor'
);

select results_eq(
  $$select role::text, terms_version, terms_accepted_at is not null, minor_data_consent_at is not null
    from public.profiles where id = 'bbbbbbbb-0000-0000-0000-000000000002'$$,
  $$values ('guardian', '2026-10', true, true)$$,
  'responsável: grava papel, versão, data do aceite e consentimento sobre o menor'
);

select ok(
  (select terms_accepted_at between now() - interval '1 minute' and now() + interval '1 minute'
   from public.profiles where id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  'a data do aceite é a do cadastro, definida pelo banco'
);

-- O cliente não consegue forjar nem apagar a prova -----------------------------------------------------

select ok(
  not has_column_privilege('authenticated', 'public.profiles', 'terms_version', 'UPDATE'),
  'o app não pode alterar terms_version'
);

select ok(
  not has_column_privilege('authenticated', 'public.profiles', 'terms_accepted_at', 'UPDATE')
  and not has_column_privilege('authenticated', 'public.profiles', 'minor_data_consent_at', 'UPDATE'),
  'o app não pode alterar as datas de aceite'
);

insert into auth.users (id, email, raw_user_meta_data) values (
  'bbbbbbbb-0000-0000-0000-000000000003', 'versao-longa@test.com',
  jsonb_build_object('role', 'teacher', 'terms_accepted', 'true', 'terms_version', repeat('x', 41))
);

select is(
  (select char_length(terms_version) from public.profiles where id = 'bbbbbbbb-0000-0000-0000-000000000003'),
  40,
  'versão acima de 40 caracteres é truncada e não derruba o cadastro'
);

select * from finish();

rollback;
