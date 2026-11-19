-- Notificações saíram do escopo do MVP (decisão do grupo, 19/11/2026). O app não tem mais a tela de
-- notificações nem o sino nas telas de início; o responsável acompanha os pedidos em "Minhas
-- solicitações" e o professor em "Solicitações recebidas".
--
-- Remove os gatilhos que geravam as notificações, as funções deles, a tabela (que sai junto da
-- publicação do Realtime) e o enum de tipos.

drop trigger if exists contact_requests_notify on public.contact_requests;
drop trigger if exists reviews_notify on public.reviews;
drop trigger if exists teacher_verifications_notify on public.teacher_verifications;
drop trigger if exists subscriptions_notify_ended on public.subscriptions;

drop function if exists public.notify_contact_request();
drop function if exists public.notify_review();
drop function if exists public.notify_teacher_verification();
drop function if exists public.notify_subscription_ended();

drop table if exists public.notifications;

drop type if exists public.notification_type;
