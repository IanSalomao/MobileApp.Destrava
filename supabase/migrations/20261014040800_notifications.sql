-- Notificações do sino (início do responsável e área do professor). São criadas pelo banco quando
-- algo acontece; o app só lê, marca como lida e apaga. O texto de cada tipo fica no app.

create type public.notification_type as enum (
  'contact_request_received',
  'contact_request_accepted',
  'contact_request_declined',
  'contact_request_expired',
  'review_received',
  'teacher_profile_approved',
  'teacher_profile_rejected',
  'subscription_ended'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  contact_request_id uuid references public.contact_requests (id) on delete cascade,
  review_id uuid references public.reviews (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.notifications is
  'Avisos para o usuário, gerados por triggers. O app traduz o type em texto.';

create index notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);
create index notifications_contact_request_id_idx
  on public.notifications (contact_request_id)
  where contact_request_id is not null;
create index notifications_review_id_idx
  on public.notifications (review_id)
  where review_id is not null;

alter table public.notifications enable row level security;

create policy "Users can read their own notifications"
  on public.notifications for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can mark their own notifications as read"
  on public.notifications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own notifications"
  on public.notifications for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke insert, update, delete on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;
grant delete on public.notifications to authenticated;

-- O sino atualiza em tempo real (o Realtime respeita o RLS acima).
alter publication supabase_realtime add table public.notifications;

-- Triggers que geram as notificações ----------------------------------------------------------

-- Professor: nova solicitação. Responsável: solicitação aceita, recusada ou expirada.
create function public.notify_contact_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, type, contact_request_id)
    values (new.teacher_id, 'contact_request_received', new.id);
  elsif new.status is distinct from old.status then
    insert into public.notifications (user_id, type, contact_request_id)
    values (
      new.guardian_id,
      case new.status
        when 'accepted' then 'contact_request_accepted'::public.notification_type
        when 'declined' then 'contact_request_declined'::public.notification_type
        when 'expired' then 'contact_request_expired'::public.notification_type
      end,
      new.id
    );
  end if;
  return null;
end;
$$;

create trigger contact_requests_notify
  after insert or update of status on public.contact_requests
  for each row execute function public.notify_contact_request();

-- Professor: nova avaliação.
create function public.notify_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (user_id, type, review_id)
  values (new.teacher_id, 'review_received', new.id);
  return null;
end;
$$;

create trigger reviews_notify
  after insert on public.reviews
  for each row execute function public.notify_review();

-- Professor: verificação aprovada ou reprovada.
create function public.notify_teacher_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status in ('approved', 'rejected') and new.status is distinct from old.status then
    insert into public.notifications (user_id, type)
    values (
      new.teacher_id,
      case new.status
        when 'approved' then 'teacher_profile_approved'::public.notification_type
        else 'teacher_profile_rejected'::public.notification_type
      end
    );
  end if;
  return null;
end;
$$;

create trigger teacher_verifications_notify
  after update of status on public.teacher_verifications
  for each row execute function public.notify_teacher_verification();

-- Professor: a assinatura terminou (cancelada ou expirada) e o perfil saiu da busca.
create function public.notify_subscription_ended()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status in ('canceled', 'expired') and new.status is distinct from old.status then
    insert into public.notifications (user_id, type)
    values (new.teacher_id, 'subscription_ended');
  end if;
  return null;
end;
$$;

create trigger subscriptions_notify_ended
  after update of status on public.subscriptions
  for each row execute function public.notify_subscription_ended();

revoke execute on function public.notify_contact_request() from public, anon, authenticated;
revoke execute on function public.notify_review() from public, anon, authenticated;
revoke execute on function public.notify_teacher_verification() from public, anon, authenticated;
revoke execute on function public.notify_subscription_ended() from public, anon, authenticated;
