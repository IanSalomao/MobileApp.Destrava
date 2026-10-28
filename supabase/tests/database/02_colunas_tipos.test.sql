-- Estrutura: colunas principais e seus tipos.

begin;

create extension if not exists pgtap with schema extensions;

select plan(10);

select col_type_is('public', 'profiles', 'id', 'uuid', 'profiles.id é uuid');
select col_type_is('public', 'profiles', 'full_name', 'text', 'profiles.full_name é text');
select col_type_is('public', 'profiles', 'role', 'user_role', 'profiles.role usa o enum user_role');
select col_type_is(
  'public', 'teachers', 'hourly_rate_cents', 'integer', 'teachers.hourly_rate_cents é integer'
);
select col_type_is(
  'public', 'teachers', 'tutoring_types', 'tutoring_type[]',
  'teachers.tutoring_types é array de tutoring_type'
);
select col_type_is(
  'public', 'students', 'school_grade', 'school_grade', 'students.school_grade usa o enum school_grade'
);
select col_type_is(
  'public', 'contact_requests', 'status', 'contact_request_status',
  'contact_requests.status usa o enum contact_request_status'
);
select col_type_is('public', 'reviews', 'rating', 'smallint', 'reviews.rating é smallint');
select col_type_is(
  'public', 'notifications', 'type', 'notification_type',
  'notifications.type usa o enum notification_type'
);
select col_type_is(
  'public', 'teacher_documents', 'kind', 'teacher_document_kind',
  'teacher_documents.kind usa o enum teacher_document_kind'
);

select * from finish();
rollback;
