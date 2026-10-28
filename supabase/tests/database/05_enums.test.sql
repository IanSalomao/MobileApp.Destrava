-- Estrutura: existência dos 11 enums e seus valores.

begin;

create extension if not exists pgtap with schema extensions;

select plan(22);

select has_enum('public', 'user_role', 'enum user_role existe');
select enum_has_labels(
  'public', 'user_role', array['guardian', 'teacher'], 'labels de user_role'
);

select has_enum('public', 'tutoring_type', 'enum tutoring_type existe');
select enum_has_labels(
  'public', 'tutoring_type', array['online', 'in_person'], 'labels de tutoring_type'
);

select has_enum('public', 'education_level', 'enum education_level existe');
select enum_has_labels(
  'public',
  'education_level',
  array['elementary_early', 'elementary_late', 'high_school'],
  'labels de education_level'
);

select has_enum('public', 'school_grade', 'enum school_grade existe');
select enum_has_labels(
  'public',
  'school_grade',
  array[
    'elementary_1', 'elementary_2', 'elementary_3', 'elementary_4', 'elementary_5',
    'elementary_6', 'elementary_7', 'elementary_8', 'elementary_9',
    'high_school_1', 'high_school_2', 'high_school_3'
  ],
  'labels de school_grade'
);

select has_enum('public', 'day_period', 'enum day_period existe');
select enum_has_labels(
  'public', 'day_period', array['morning', 'afternoon', 'evening'], 'labels de day_period'
);

select has_enum('public', 'verification_status', 'enum verification_status existe');
select enum_has_labels(
  'public',
  'verification_status',
  array['draft', 'pending_review', 'approved', 'rejected'],
  'labels de verification_status'
);

select has_enum('public', 'teacher_document_kind', 'enum teacher_document_kind existe');
select enum_has_labels(
  'public',
  'teacher_document_kind',
  array['identity', 'certificate'],
  'labels de teacher_document_kind'
);

select has_enum('public', 'social_network', 'enum social_network existe');
select enum_has_labels(
  'public',
  'social_network',
  array['instagram', 'facebook', 'linkedin', 'tiktok', 'youtube', 'website'],
  'labels de social_network'
);

select has_enum('public', 'contact_request_status', 'enum contact_request_status existe');
select enum_has_labels(
  'public',
  'contact_request_status',
  array['pending', 'accepted', 'declined', 'expired', 'cancelled'],
  'labels de contact_request_status'
);

select has_enum('public', 'subscription_status', 'enum subscription_status existe');
select enum_has_labels(
  'public',
  'subscription_status',
  array['trialing', 'active', 'canceled', 'expired'],
  'labels de subscription_status'
);

select has_enum('public', 'notification_type', 'enum notification_type existe');
select enum_has_labels(
  'public',
  'notification_type',
  array[
    'contact_request_received', 'contact_request_accepted', 'contact_request_declined',
    'contact_request_expired', 'review_received', 'teacher_profile_approved',
    'teacher_profile_rejected', 'subscription_ended'
  ],
  'labels de notification_type'
);

select * from finish();
rollback;
