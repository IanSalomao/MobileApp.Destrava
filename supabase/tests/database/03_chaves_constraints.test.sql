-- Estrutura: chaves primárias, chaves estrangeiras e unicidade.

begin;

create extension if not exists pgtap with schema extensions;

select plan(10);

select has_pk('public', 'profiles', 'profiles tem PK');
select has_pk('public', 'teachers', 'teachers tem PK');
select has_pk('public', 'contact_requests', 'contact_requests tem PK');
select has_pk('public', 'reviews', 'reviews tem PK');
select has_pk('public', 'subscriptions', 'subscriptions tem PK');

select fk_ok(
  'public', 'teachers', 'id', 'public', 'profiles', 'id',
  'teachers.id referencia profiles.id'
);
select fk_ok(
  'public', 'contact_requests', 'teacher_id', 'public', 'teachers', 'id',
  'contact_requests.teacher_id referencia teachers.id'
);
select fk_ok(
  'public', 'reviews', 'guardian_id', 'public', 'profiles', 'id',
  'reviews.guardian_id referencia profiles.id'
);
select fk_ok(
  'public', 'subscription_payments', 'teacher_id', 'public', 'subscriptions', 'teacher_id',
  'subscription_payments.teacher_id referencia subscriptions.teacher_id'
);
select has_unique(
  'public', 'reviews', 'reviews tem unique (guardian_id, teacher_id)'
);

select * from finish();
rollback;
