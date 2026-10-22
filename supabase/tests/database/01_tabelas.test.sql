-- Estrutura: existência das 19 tabelas do schema public.

begin;

create extension if not exists pgtap with schema extensions;

select plan(19);

select has_table('public', 'profiles', 'profiles existe');
select has_table('public', 'teachers', 'teachers existe');
select has_table('public', 'contact_details', 'contact_details existe');
select has_table('public', 'subjects', 'subjects existe');
select has_table('public', 'languages', 'languages existe');
select has_table('public', 'teacher_subjects', 'teacher_subjects existe');
select has_table('public', 'teacher_languages', 'teacher_languages existe');
select has_table('public', 'teacher_social_links', 'teacher_social_links existe');
select has_table('public', 'teacher_verifications', 'teacher_verifications existe');
select has_table('public', 'teacher_documents', 'teacher_documents existe');
select has_table('public', 'students', 'students existe');
select has_table('public', 'student_subjects', 'student_subjects existe');
select has_table('public', 'contact_requests', 'contact_requests existe');
select has_table('public', 'reviews', 'reviews existe');
select has_table('public', 'favorite_teachers', 'favorite_teachers existe');
select has_table('public', 'subscription_plans', 'subscription_plans existe');
select has_table('public', 'subscriptions', 'subscriptions existe');
select has_table('public', 'subscription_payments', 'subscription_payments existe');
select has_table('public', 'notifications', 'notifications existe');

select * from finish();
rollback;
