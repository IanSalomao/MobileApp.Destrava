-- Estrutura: created_at/updated_at e triggers de updated_at nas tabelas principais.

begin;

create extension if not exists pgtap with schema extensions;

select plan(30);

-- profiles
select col_type_is(
  'public', 'profiles', 'created_at', 'timestamp with time zone', 'profiles.created_at é timestamptz'
);
select col_type_is(
  'public', 'profiles', 'updated_at', 'timestamp with time zone', 'profiles.updated_at é timestamptz'
);
select col_not_null('public', 'profiles', 'created_at', 'profiles.created_at é NOT NULL');
select col_not_null('public', 'profiles', 'updated_at', 'profiles.updated_at é NOT NULL');
select has_trigger(
  'public', 'profiles', 'profiles_set_updated_at', 'profiles tem trigger de updated_at'
);

-- teachers
select col_type_is(
  'public', 'teachers', 'created_at', 'timestamp with time zone', 'teachers.created_at é timestamptz'
);
select col_type_is(
  'public', 'teachers', 'updated_at', 'timestamp with time zone', 'teachers.updated_at é timestamptz'
);
select col_not_null('public', 'teachers', 'created_at', 'teachers.created_at é NOT NULL');
select col_not_null('public', 'teachers', 'updated_at', 'teachers.updated_at é NOT NULL');
select has_trigger(
  'public', 'teachers', 'teachers_set_updated_at', 'teachers tem trigger de updated_at'
);

-- students
select col_type_is(
  'public', 'students', 'created_at', 'timestamp with time zone', 'students.created_at é timestamptz'
);
select col_type_is(
  'public', 'students', 'updated_at', 'timestamp with time zone', 'students.updated_at é timestamptz'
);
select col_not_null('public', 'students', 'created_at', 'students.created_at é NOT NULL');
select col_not_null('public', 'students', 'updated_at', 'students.updated_at é NOT NULL');
select has_trigger(
  'public', 'students', 'students_set_updated_at', 'students tem trigger de updated_at'
);

-- contact_requests
select col_type_is(
  'public', 'contact_requests', 'created_at', 'timestamp with time zone',
  'contact_requests.created_at é timestamptz'
);
select col_type_is(
  'public', 'contact_requests', 'updated_at', 'timestamp with time zone',
  'contact_requests.updated_at é timestamptz'
);
select col_not_null(
  'public', 'contact_requests', 'created_at', 'contact_requests.created_at é NOT NULL'
);
select col_not_null(
  'public', 'contact_requests', 'updated_at', 'contact_requests.updated_at é NOT NULL'
);
select has_trigger(
  'public', 'contact_requests', 'contact_requests_set_updated_at',
  'contact_requests tem trigger de updated_at'
);

-- reviews
select col_type_is(
  'public', 'reviews', 'created_at', 'timestamp with time zone', 'reviews.created_at é timestamptz'
);
select col_type_is(
  'public', 'reviews', 'updated_at', 'timestamp with time zone', 'reviews.updated_at é timestamptz'
);
select col_not_null('public', 'reviews', 'created_at', 'reviews.created_at é NOT NULL');
select col_not_null('public', 'reviews', 'updated_at', 'reviews.updated_at é NOT NULL');
select has_trigger(
  'public', 'reviews', 'reviews_set_updated_at', 'reviews tem trigger de updated_at'
);

-- subscriptions
select col_type_is(
  'public', 'subscriptions', 'created_at', 'timestamp with time zone',
  'subscriptions.created_at é timestamptz'
);
select col_type_is(
  'public', 'subscriptions', 'updated_at', 'timestamp with time zone',
  'subscriptions.updated_at é timestamptz'
);
select col_not_null('public', 'subscriptions', 'created_at', 'subscriptions.created_at é NOT NULL');
select col_not_null('public', 'subscriptions', 'updated_at', 'subscriptions.updated_at é NOT NULL');
select has_trigger(
  'public', 'subscriptions', 'subscriptions_set_updated_at',
  'subscriptions tem trigger de updated_at'
);

select * from finish();
rollback;
