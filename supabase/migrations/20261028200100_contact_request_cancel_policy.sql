-- Cancelamento pelo responsável e transições de status do ciclo da solicitação.
-- O professor responde accepted/declined; o responsável cancela enquanto pending;
-- o job do banco expira as pendentes vencidas.

create or replace function public.guard_contact_request_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    if old.status <> 'pending' then
      raise exception 'contact_request_already_answered';
    end if;

    if auth.uid() is not null then
      if new.status = 'cancelled' then
        if old.guardian_id <> auth.uid() then
          raise exception 'contact_request_not_allowed';
        end if;
      elsif new.status in ('accepted', 'declined') then
        if old.teacher_id <> auth.uid() then
          raise exception 'contact_request_not_allowed';
        end if;
        if old.expires_at <= now() then
          raise exception 'contact_request_expired';
        end if;
      else
        raise exception 'contact_request_invalid_status';
      end if;
    end if;

    if new.status in ('accepted', 'declined') then
      new.responded_at := now();
    end if;
  end if;

  return new;
end;
$$;

-- O cancelamento é do responsável dono da solicitação; o aceite/recusa é do professor.
drop policy "Teachers can answer pending contact requests" on public.contact_requests;

create policy "Teachers can answer pending contact requests"
  on public.contact_requests for update
  to authenticated
  using ((select auth.uid()) = teacher_id and status = 'pending')
  with check ((select auth.uid()) = teacher_id and status in ('accepted', 'declined'));

create policy "Guardians can cancel pending contact requests"
  on public.contact_requests for update
  to authenticated
  using ((select auth.uid()) = guardian_id and status = 'pending')
  with check ((select auth.uid()) = guardian_id and status = 'cancelled');

-- O cancelamento não gera notificação (não há notification_type para ele), mas o
-- trigger de notificação também não pode tentar inserir um type nulo.
create or replace function public.notify_contact_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, type, contact_request_id)
    values (new.teacher_id, 'contact_request_received', new.id);
  elsif new.status is distinct from old.status
    and new.status in ('accepted', 'declined', 'expired') then
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
