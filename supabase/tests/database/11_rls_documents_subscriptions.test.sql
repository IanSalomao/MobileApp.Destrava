-- RLS: documentos, verificação, assinatura, pagamentos e catálogo.

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(19);

-- Setup ---------------------------------------------------------------------------------------

insert into auth.users (id, email, raw_user_meta_data) values
  (
    '33333333-3333-3333-3333-333333333333',
    'teacher1@test.com',
    '{"role":"teacher","full_name":"Teacher One","phone":"+5511999990003"}'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'teacher2@test.com',
    '{"role":"teacher","full_name":"Teacher Two","phone":"+5511999990004"}'::jsonb
  );

-- Assinatura e pagamento do teacher1, criados como postgres.
insert into public.subscriptions (
  teacher_id, plan_id, status, current_period_start, current_period_end
)
values (
  '33333333-3333-3333-3333-333333333333',
  'teacher_launch',
  'active',
  now(),
  now() + interval '1 month'
);

insert into public.subscription_payments (
  teacher_id, plan_id, amount_cents, period_start, period_end, card_brand, card_last4
)
values (
  '33333333-3333-3333-3333-333333333333',
  'teacher_launch',
  2990,
  now(),
  now() + interval '1 month',
  'visa',
  '4242'
);

-- Plano inativo para o teste negativo do catálogo.
insert into public.subscription_plans (id, name, price_cents, trial_days, is_active)
values ('inactive_plan', 'Plano Inativo', 1000, 0, false);

-- teacher1 -------------------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

select isnt_empty(
  $$select teacher_id from public.teacher_verifications
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'professor lê a própria verificação'
);

select results_eq(
  $$update public.teacher_verifications
    set cpf = '52998224725'
    where teacher_id = '33333333-3333-3333-3333-333333333333'
    returning cpf$$,
  array['52998224725'::text],
  'professor atualiza o próprio CPF em draft'
);

select lives_ok(
  $$insert into public.teacher_documents (kind, storage_path, file_name)
    values (
      'identity',
      '33333333-3333-3333-3333-333333333333/rg.pdf',
      'rg.pdf'
    )$$,
  'professor envia documento de identidade'
);

select lives_ok(
  $$insert into public.teacher_documents (kind, storage_path, file_name)
    values (
      'certificate',
      '33333333-3333-3333-3333-333333333333/certificado.pdf',
      'certificado.pdf'
    )$$,
  'professor envia certificado'
);

select results_eq(
  $$delete from public.teacher_documents
    where storage_path = '33333333-3333-3333-3333-333333333333/certificado.pdf'
    returning storage_path$$,
  array['33333333-3333-3333-3333-333333333333/certificado.pdf'::text],
  'professor apaga o próprio certificado'
);

select isnt_empty(
  $$select teacher_id from public.subscriptions
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'professor lê a própria assinatura'
);

select isnt_empty(
  $$select id from public.subscription_payments
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'professor lê o próprio pagamento'
);

select throws_ok(
  $$update public.subscriptions
    set status = 'canceled'
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  '42501',
  null,
  'professor não altera a assinatura diretamente'
);

select throws_ok(
  $$update public.subscription_payments
    set amount_cents = 0
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  '42501',
  null,
  'professor não altera o pagamento diretamente'
);

-- teacher2 -------------------------------------------------------------------------------------

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';

select is_empty(
  $$select teacher_id from public.teacher_verifications
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'outro professor não lê a verificação'
);

select is_empty(
  $$update public.teacher_verifications
    set cpf = '11144477735'
    where teacher_id = '33333333-3333-3333-3333-333333333333'
    returning cpf$$,
  'outro professor não atualiza o CPF'
);

select is_empty(
  $$select id from public.teacher_documents
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'outro professor não lê os documentos'
);

select is_empty(
  $$delete from public.teacher_documents
    where storage_path = '33333333-3333-3333-3333-333333333333/rg.pdf'
    returning id$$,
  'outro professor não apaga o documento'
);

select is_empty(
  $$select teacher_id from public.subscriptions
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'outro professor não lê a assinatura'
);

select is_empty(
  $$select id from public.subscription_payments
    where teacher_id = '33333333-3333-3333-3333-333333333333'$$,
  'outro professor não lê o pagamento'
);

-- Catálogo público -----------------------------------------------------------------------------

reset role;
set local role anon;
reset request.jwt.claim.sub;

select isnt_empty(
  $$select id from public.subscription_plans where id = 'teacher_launch'$$,
  'anônimo lê plano ativo'
);

select is_empty(
  $$select id from public.subscription_plans where id = 'inactive_plan'$$,
  'anônimo não lê plano inativo'
);

select isnt_empty(
  $$select id from public.subjects$$,
  'anônimo lê as matérias'
);

select isnt_empty(
  $$select id from public.languages$$,
  'anônimo lê os idiomas'
);

select * from finish();
rollback;
