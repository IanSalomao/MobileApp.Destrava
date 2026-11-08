-- Localização predefinida do professor: enum brazilian_state, tabela cities (IBGE) e FK composta
-- (state, city_id) com match full em teachers.

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(12);

-- Catálogo -------------------------------------------------------------------------------------

select is(
  (select count(*)::integer from public.cities),
  5571,
  'cities traz os 5.571 municípios do IBGE'
);

select is(
  (select count(distinct state)::integer from public.cities),
  27,
  'cities cobre as 27 UFs'
);

select is(
  cardinality(enum_range(null::public.brazilian_state)),
  27,
  'brazilian_state tem as 27 siglas'
);

select is(
  (select name from public.cities where id = 3550308),
  'São Paulo',
  'id é o código IBGE do município'
);

-- Setup ---------------------------------------------------------------------------------------

insert into auth.users (id, email, raw_user_meta_data) values (
  '33333333-3333-3333-3333-333333333333',
  'teacher1@test.com',
  '{"role":"teacher","full_name":"Teacher One","phone":"+5511999990003","terms_accepted":"true","terms_version":"test-1"}'::jsonb
);

-- Professor -----------------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

select is(
  (select count(*)::integer from public.cities where state = 'SP'),
  645,
  'usuário autenticado lê as cidades de um estado'
);

select lives_ok(
  $$ update public.teachers set state = 'SP', city_id = 3550308
     where id = '33333333-3333-3333-3333-333333333333' $$,
  'professor grava estado e cidade do mesmo estado'
);

select throws_ok(
  $$ update public.teachers set state = 'RJ', city_id = 3550308
     where id = '33333333-3333-3333-3333-333333333333' $$,
  '23503',
  null,
  'cidade de outro estado é recusada pela FK composta'
);

select throws_ok(
  $$ update public.teachers set city_id = null
     where id = '33333333-3333-3333-3333-333333333333' $$,
  '23503',
  null,
  'estado sem cidade é recusado (match full)'
);

select throws_ok(
  $$ update public.teachers set state = 'XX'
     where id = '33333333-3333-3333-3333-333333333333' $$,
  '22P02',
  null,
  'sigla fora do enum é recusada'
);

select throws_ok(
  $$ insert into public.cities (id, name, state) values (9999999, 'Cidade Inventada', 'SP') $$,
  '42501',
  null,
  'usuário não cria cidade (só por migração)'
);

select lives_ok(
  $$ update public.teachers set state = null, city_id = null
     where id = '33333333-3333-3333-3333-333333333333' $$,
  'estado e cidade podem ficar os dois nulos'
);

-- Visitante -----------------------------------------------------------------------------------

set local role anon;
reset request.jwt.claim.sub;

select is(
  (select count(*)::integer from public.cities),
  0,
  'visitante anônimo não lê cidades (RF03)'
);

select * from finish();
rollback;
