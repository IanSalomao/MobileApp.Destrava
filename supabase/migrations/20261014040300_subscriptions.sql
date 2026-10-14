-- Assinatura do professor com período de teste (RF13) e publicação do perfil.
--
-- No MVP a cobrança é SIMULADA: o app não envia o número do cartão nem o CVV, só a bandeira, os
-- últimos 4 dígitos e a validade, e toda cobrança fictícia é aprovada. O ciclo de vida é real:
-- teste de 7 dias, cobrança mensal, cancelamento no fim do período e expiração sem cartão.
-- Quando houver um gateway de verdade, a cobrança passa para Edge Functions e webhooks.

create extension if not exists pg_cron with schema pg_catalog;

-- trialing: no teste grátis. active: período pago em andamento.
-- canceled: cancelada pelo professor, terminou no fim do período.
-- expired: o teste ou o período terminou sem cartão válido.
create type public.subscription_status as enum ('trialing', 'active', 'canceled', 'expired');

create table public.subscription_plans (
  id text primary key check (id ~ '^[a-z][a-z0-9_]*$'),
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  trial_days smallint not null default 0 check (trial_days >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.subscription_plans is 'Planos de assinatura do professor. Cobrança mensal.';

insert into public.subscription_plans (id, name, price_cents, trial_days)
values ('teacher_launch', 'Professor Destrava', 2990, 7);

-- Uma assinatura por professor. Ao reassinar, a mesma linha é reaproveitada; o histórico de
-- cobranças fica em subscription_payments.
create table public.subscriptions (
  teacher_id uuid primary key references public.teachers (id) on delete cascade,
  plan_id text not null references public.subscription_plans (id),
  status public.subscription_status not null,
  trial_ends_at timestamptz,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  ended_at timestamptz,
  card_brand text check (
    card_brand in ('visa', 'mastercard', 'amex', 'elo', 'hipercard', 'diners', 'other')
  ),
  card_last4 text check (card_last4 ~ '^[0-9]{4}$'),
  card_exp_month smallint check (card_exp_month between 1 and 12),
  card_exp_year smallint check (card_exp_year between 2000 and 2100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (current_period_end > current_period_start),
  check (num_nulls(card_brand, card_last4, card_exp_month, card_exp_year) in (0, 4))
);

comment on column public.subscriptions.trial_ends_at is
  'Fim do teste grátis. Preenchido também indica que o professor já usou o teste.';
comment on column public.subscriptions.current_period_end is
  'Fim do período atual (no teste, igual a trial_ends_at). Aqui acontece a próxima cobrança.';
comment on column public.subscriptions.card_last4 is
  'Cartão fictício: só bandeira, últimos 4 dígitos e validade. Nulo = "Continuar sem cartão".';

create index subscriptions_due_idx
  on public.subscriptions (current_period_end)
  where status in ('trialing', 'active');
create index subscriptions_plan_id_idx on public.subscriptions (plan_id);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Histórico de cobranças simuladas.
create table public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.subscriptions (teacher_id) on delete cascade,
  plan_id text not null references public.subscription_plans (id),
  amount_cents integer not null check (amount_cents >= 0),
  period_start timestamptz not null,
  period_end timestamptz not null,
  card_brand text not null,
  card_last4 text not null,
  paid_at timestamptz not null default now()
);

comment on table public.subscription_payments is 'Cobranças da assinatura. No MVP são simuladas.';

create index subscription_payments_teacher_id_paid_at_idx
  on public.subscription_payments (teacher_id, paid_at desc);
create index subscription_payments_plan_id_idx on public.subscription_payments (plan_id);

-- RLS: o professor só lê a própria assinatura e as próprias cobranças. Escrita só pelas funções.
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_payments enable row level security;

create policy "Anyone can read active plans"
  on public.subscription_plans for select
  to anon, authenticated
  using (is_active);

create policy "Teachers can read their own subscription"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = teacher_id);

create policy "Teachers can read their own payments"
  on public.subscription_payments for select
  to authenticated
  using ((select auth.uid()) = teacher_id);

revoke insert, update, delete on
  public.subscription_plans,
  public.subscriptions,
  public.subscription_payments
from anon, authenticated;

-- Funções internas ------------------------------------------------------------------------------

create function public.is_card_expired(exp_month smallint, exp_year smallint)
returns boolean
language sql
stable
set search_path = ''
as $$
  select make_date(exp_year, exp_month, 1) + interval '1 month' <= now();
$$;

-- Registra uma cobrança simulada com o plano e o cartão atuais da assinatura.
create function public.record_subscription_payment(
  p_teacher_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.subscription_payments (
    teacher_id, plan_id, amount_cents, period_start, period_end, card_brand, card_last4
  )
  select s.teacher_id, s.plan_id, p.price_cents, p_period_start, p_period_end, s.card_brand, s.card_last4
  from public.subscriptions s
  join public.subscription_plans p on p.id = s.plan_id
  where s.teacher_id = p_teacher_id;
$$;

revoke execute on function public.is_card_expired(smallint, smallint) from public, anon, authenticated;
revoke execute on function public.record_subscription_payment(uuid, timestamptz, timestamptz)
  from public, anon, authenticated;

-- RPCs do app -----------------------------------------------------------------------------------
-- Erros: not_a_teacher, plan_not_available, card_incomplete, card_expired, card_required,
-- subscription_already_active, subscription_not_active.

-- "Assinar e continuar" e "Continuar sem cartão". Na primeira assinatura começa o teste grátis,
-- com ou sem cartão; sem cartão, a assinatura expira no fim do teste. Ao reassinar (o teste já
-- foi usado), o cartão é obrigatório e a primeira mensalidade é cobrada na hora.
create function public.start_subscription(
  p_plan_id text,
  p_card_brand text default null,
  p_card_last4 text default null,
  p_card_exp_month smallint default null,
  p_card_exp_year smallint default null
)
returns public.subscriptions
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  card_nulls integer := num_nulls(p_card_brand, p_card_last4, p_card_exp_month, p_card_exp_year);
  plan public.subscription_plans;
  existing public.subscriptions;
  has_subscription boolean;
  trial_end timestamptz;
  result public.subscriptions;
begin
  if not exists (select 1 from public.teachers where id = current_user_id) then
    raise exception 'not_a_teacher' using errcode = '42501';
  end if;

  select * into plan from public.subscription_plans where id = p_plan_id and is_active;
  if not found then
    raise exception 'plan_not_available';
  end if;

  if card_nulls not in (0, 4) then
    raise exception 'card_incomplete';
  end if;
  if card_nulls = 0 and public.is_card_expired(p_card_exp_month, p_card_exp_year) then
    raise exception 'card_expired';
  end if;

  select * into existing from public.subscriptions where teacher_id = current_user_id for update;
  has_subscription := found;

  if has_subscription and existing.status in ('trialing', 'active') then
    raise exception 'subscription_already_active';
  end if;

  if not has_subscription and plan.trial_days > 0 then
    trial_end := now() + make_interval(days => plan.trial_days);

    insert into public.subscriptions (
      teacher_id, plan_id, status, trial_ends_at, current_period_start, current_period_end,
      card_brand, card_last4, card_exp_month, card_exp_year
    )
    values (
      current_user_id, plan.id, 'trialing', trial_end, now(), trial_end,
      p_card_brand, p_card_last4, p_card_exp_month, p_card_exp_year
    )
    returning * into result;

    return result;
  end if;

  if card_nulls > 0 then
    raise exception 'card_required';
  end if;

  insert into public.subscriptions (
    teacher_id, plan_id, status, current_period_start, current_period_end,
    card_brand, card_last4, card_exp_month, card_exp_year
  )
  values (
    current_user_id, plan.id, 'active', now(), now() + interval '1 month',
    p_card_brand, p_card_last4, p_card_exp_month, p_card_exp_year
  )
  on conflict (teacher_id) do update set
    plan_id = excluded.plan_id,
    status = excluded.status,
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    cancel_at_period_end = false,
    ended_at = null,
    card_brand = excluded.card_brand,
    card_last4 = excluded.card_last4,
    card_exp_month = excluded.card_exp_month,
    card_exp_year = excluded.card_exp_year
  returning * into result;

  perform public.record_subscription_payment(
    current_user_id, result.current_period_start, result.current_period_end
  );

  return result;
end;
$$;

-- Cadastra ou troca o cartão de uma assinatura em andamento (ex.: depois do "Continuar sem cartão").
create function public.update_subscription_card(
  p_card_brand text,
  p_card_last4 text,
  p_card_exp_month smallint,
  p_card_exp_year smallint
)
returns public.subscriptions
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.subscriptions;
begin
  if num_nulls(p_card_brand, p_card_last4, p_card_exp_month, p_card_exp_year) > 0 then
    raise exception 'card_incomplete';
  end if;
  if public.is_card_expired(p_card_exp_month, p_card_exp_year) then
    raise exception 'card_expired';
  end if;

  update public.subscriptions
  set card_brand = p_card_brand,
    card_last4 = p_card_last4,
    card_exp_month = p_card_exp_month,
    card_exp_year = p_card_exp_year
  where teacher_id = auth.uid() and status in ('trialing', 'active')
  returning * into result;

  if not found then
    raise exception 'subscription_not_active';
  end if;

  return result;
end;
$$;

-- Cancela no fim do período: o perfil segue publicado até lá ("Cancele quando quiser").
create function public.cancel_subscription()
returns public.subscriptions
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.subscriptions;
begin
  update public.subscriptions
  set cancel_at_period_end = true
  where teacher_id = auth.uid() and status in ('trialing', 'active')
  returning * into result;

  if not found then
    raise exception 'subscription_not_active';
  end if;

  return result;
end;
$$;

-- Desfaz o cancelamento enquanto o período ainda não terminou.
create function public.resume_subscription()
returns public.subscriptions
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.subscriptions;
begin
  update public.subscriptions
  set cancel_at_period_end = false
  where teacher_id = auth.uid() and status in ('trialing', 'active')
  returning * into result;

  if not found then
    raise exception 'subscription_not_active';
  end if;

  return result;
end;
$$;

revoke execute on function public.start_subscription(text, text, text, smallint, smallint)
  from public, anon;
revoke execute on function public.update_subscription_card(text, text, smallint, smallint)
  from public, anon;
revoke execute on function public.cancel_subscription() from public, anon;
revoke execute on function public.resume_subscription() from public, anon;
grant execute on function public.start_subscription(text, text, text, smallint, smallint)
  to authenticated;
grant execute on function public.update_subscription_card(text, text, smallint, smallint)
  to authenticated;
grant execute on function public.cancel_subscription() to authenticated;
grant execute on function public.resume_subscription() to authenticated;

-- Fim de período (pg_cron) ----------------------------------------------------------------------

-- Para cada assinatura cujo período terminou: cancela, expira (sem cartão válido) ou cobra mais
-- um mês. Se o job ficou parado por mais de um mês, recomeça a contar de agora em vez de cobrar
-- os meses atrasados.
create function public.process_due_subscriptions()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  due public.subscriptions;
  next_start timestamptz;
begin
  for due in
    select * from public.subscriptions
    where status in ('trialing', 'active') and current_period_end <= now()
    for update skip locked
  loop
    if due.cancel_at_period_end then
      update public.subscriptions
      set status = 'canceled', ended_at = due.current_period_end
      where teacher_id = due.teacher_id;
    elsif due.card_last4 is null or public.is_card_expired(due.card_exp_month, due.card_exp_year) then
      update public.subscriptions
      set status = 'expired', ended_at = due.current_period_end
      where teacher_id = due.teacher_id;
    else
      next_start := due.current_period_end;
      if next_start + interval '1 month' <= now() then
        next_start := now();
      end if;

      update public.subscriptions
      set status = 'active',
        current_period_start = next_start,
        current_period_end = next_start + interval '1 month'
      where teacher_id = due.teacher_id;

      perform public.record_subscription_payment(
        due.teacher_id, next_start, next_start + interval '1 month'
      );
    end if;
  end loop;
end;
$$;

revoke execute on function public.process_due_subscriptions() from public, anon, authenticated;

select cron.schedule(
  'process-due-subscriptions',
  '*/15 * * * *',
  'select public.process_due_subscriptions()'
);

-- Publicação do perfil ----------------------------------------------------------------------------

-- O professor aparece para as famílias quando a verificação está aprovada e a assinatura está em
-- teste ou ativa. Recalculado sempre que um dos dois status muda.
create function public.refresh_teacher_publication(p_teacher_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.teachers t
  set is_published = x.should_publish
  from (
    select
      exists (
        select 1 from public.teacher_verifications v
        where v.teacher_id = p_teacher_id and v.status = 'approved'
      )
      and exists (
        select 1 from public.subscriptions s
        where s.teacher_id = p_teacher_id and s.status in ('trialing', 'active')
      ) as should_publish
  ) x
  where t.id = p_teacher_id and t.is_published is distinct from x.should_publish;
$$;

create function public.refresh_teacher_publication_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.refresh_teacher_publication(new.teacher_id);
  return null;
end;
$$;

create trigger teacher_verifications_refresh_publication
  after insert or update of status on public.teacher_verifications
  for each row execute function public.refresh_teacher_publication_trigger();

create trigger subscriptions_refresh_publication
  after insert or update of status on public.subscriptions
  for each row execute function public.refresh_teacher_publication_trigger();

revoke execute on function public.refresh_teacher_publication(uuid) from public, anon, authenticated;
revoke execute on function public.refresh_teacher_publication_trigger()
  from public, anon, authenticated;
