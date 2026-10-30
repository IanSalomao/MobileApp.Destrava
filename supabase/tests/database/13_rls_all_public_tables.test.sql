-- Estrutura e Segurança: toda tabela do schema public tem RLS ativo e políticas (DB-11).

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(2);

-- 1. Nenhuma tabela do schema public pode estar com rowsecurity = false -----------------------

select is_empty(
  $$select tablename::text
    from pg_catalog.pg_tables
    where schemaname = 'public'
      and rowsecurity = false
      and tablename not in ('spatial_ref_sys')$$,
  'todas as tabelas do schema public em pg_tables estão com rowsecurity = true'
);

-- 2. Verificação direta no catálogo pg_class (relrowsecurity = true) --------------------------

select is_empty(
  $$select c.relname::text
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and c.relrowsecurity = false
      and c.relname not in ('spatial_ref_sys')$$,
  'todas as tabelas do schema public em pg_class estão com relrowsecurity = true'
);

select * from finish();
rollback;