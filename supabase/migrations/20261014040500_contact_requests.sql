-- Solicitações de contato (RF07, RF08) e o que o aceite libera: o celular dos dois lados para o
-- botão do WhatsApp (RF09, RF10) e as redes sociais do professor (RF11). Não há chat no app.
--
-- Status: pending -> accepted | declined (só o professor, RF08) | expired (sem resposta em 24 h,
-- "Ana tem até 24 horas para responder").

create type public.contact_request_status as enum ('pending', 'accepted', 'declined', 'expired');

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  student_id uuid references public.students (id) on delete set null,
  -- Cópia do que foi enviado no formulário. O professor lê daqui, nunca da tabela students.
  guardian_name text not null check (char_length(btrim(guardian_name)) between 1 and 120),
  student_name text not null check (char_length(btrim(student_name)) between 1 and 120),
  student_school_grade public.school_grade not null,
  student_age smallint check (student_age between 3 and 25),
  reason text not null check (char_length(btrim(reason)) between 1 and 1000),
  preferred_tutoring_type public.tutoring_type,
  status public.contact_request_status not null default 'pending',
  expires_at timestamptz not null default now() + interval '24 hours',
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (guardian_id <> teacher_id)
);

comment on table public.contact_requests is
  'Pedido de contato do responsável para o professor. O aceite libera WhatsApp e redes sociais.';
comment on column public.contact_requests.student_id is
  'Aluno de origem, se houver. Os dados enviados ficam nas colunas student_* (cópia).';
comment on column public.contact_requests.preferred_tutoring_type is
  '"Prefiro aulas online" vira online. Nulo = sem preferência.';
comment on column public.contact_requests.expires_at is
  'Prazo de resposta do professor. Depois dele a solicitação vira expired e o pai pode pedir de novo.';

-- No máximo uma solicitação em aberto ou aceita por par responsável/professor.
create unique index contact_requests_open_pair_key
  on public.contact_requests (guardian_id, teacher_id)
  where status in ('pending', 'accepted');

create index contact_requests_guardian_id_created_at_idx
  on public.contact_requests (guardian_id, created_at desc);
create index contact_requests_teacher_id_created_at_idx
  on public.contact_requests (teacher_id, created_at desc);
create index contact_requests_student_id_idx
  on public.contact_requests (student_id)
  where student_id is not null;
create index contact_requests_pending_expires_at_idx
  on public.contact_requests (expires_at)
  where status = 'pending';

create trigger contact_requests_set_updated_at
  before update on public.contact_requests
  for each row execute function public.set_updated_at();

-- Garante as transições de status. Pelo app (com usuário logado) só é possível aceitar ou recusar
-- uma solicitação pendente e dentro do prazo. A expiração é feita pelo job do banco.
create function public.guard_contact_request_status()
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
      if new.status not in ('accepted', 'declined') then
        raise exception 'contact_request_invalid_status';
      end if;
      if old.expires_at <= now() then
        raise exception 'contact_request_expired';
      end if;
    end if;

    if new.status in ('accepted', 'declined') then
      new.responded_at := now();
    end if;
  end if;

  return new;
end;
$$;

create trigger contact_requests_guard_status
  before update on public.contact_requests
  for each row execute function public.guard_contact_request_status();

-- RLS ------------------------------------------------------------------------------------------

alter table public.contact_requests enable row level security;

create policy "Participants can read their contact requests"
  on public.contact_requests for select
  to authenticated
  using ((select auth.uid()) in (guardian_id, teacher_id));

-- RF07: só responsáveis, só para professores publicados e só com um aluno do próprio responsável.
create policy "Guardians can send contact requests to published teachers"
  on public.contact_requests for insert
  to authenticated
  with check (
    (select auth.uid()) = guardian_id
    and private.is_guardian(guardian_id)
    and private.is_published_teacher(teacher_id)
    and (
      student_id is null
      or exists (
        select 1 from public.students s
        where s.id = contact_requests.student_id and s.guardian_id = contact_requests.guardian_id
      )
    )
  );

-- RF08: só o professor dono responde, e só a status (o trigger valida a transição).
create policy "Teachers can answer pending contact requests"
  on public.contact_requests for update
  to authenticated
  using ((select auth.uid()) = teacher_id and status = 'pending')
  with check ((select auth.uid()) = teacher_id);

revoke insert, update, delete on public.contact_requests from anon, authenticated;
grant insert (
  teacher_id,
  student_id,
  guardian_name,
  student_name,
  student_school_grade,
  student_age,
  reason,
  preferred_tutoring_type
) on public.contact_requests to authenticated;
grant update (status) on public.contact_requests to authenticated;

-- O que cada lado passa a ver -------------------------------------------------------------------
-- As políticas de leitura abaixo substituem as das migrações anteriores, acrescentando as regras
-- que dependem de contact_requests (uma política de leitura por tabela, regras em OR).

-- profiles: além do dono e dos professores publicados, nome e foto da outra parte de uma
-- solicitação, em qualquer status (o professor precisa ver quem pediu).
drop policy "Profiles are visible to the owner and for published teachers" on public.profiles;

create policy "Profiles visible to owner, published teachers and counterparts"
  on public.profiles for select
  to anon, authenticated
  using (
    (select auth.uid()) = id
    or private.is_published_teacher(id)
    or exists (
      select 1 from public.contact_requests r
      where (r.guardian_id = (select auth.uid()) and r.teacher_id = profiles.id)
        or (r.teacher_id = (select auth.uid()) and r.guardian_id = profiles.id)
    )
  );

-- teachers: o responsável continua vendo o perfil profissional de quem contatou, mesmo que o
-- professor saia da busca depois (lista de contatos e acompanhamento da solicitação).
drop policy "Teachers are visible when published or to the owner" on public.teachers;

create policy "Teachers visible when published, to the owner or to contacts"
  on public.teachers for select
  to anon, authenticated
  using (
    is_published
    or (select auth.uid()) = id
    or exists (
      select 1 from public.contact_requests r
      where r.teacher_id = teachers.id and r.guardian_id = (select auth.uid())
    )
  );

-- contact_details, RF09/RF10: o celular (WhatsApp) da outra parte, só depois do aceite.
drop policy "Users can read their own contact details" on public.contact_details;

create policy "Contact details visible to the owner and accepted contacts"
  on public.contact_details for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.contact_requests r
      where r.status = 'accepted'
        and (
          (r.guardian_id = (select auth.uid()) and r.teacher_id = contact_details.user_id)
          or (r.teacher_id = (select auth.uid()) and r.guardian_id = contact_details.user_id)
        )
    )
  );

-- teacher_social_links, RF11: redes sociais só para o responsável com solicitação aceita.
drop policy "Teachers can read their own social links" on public.teacher_social_links;

create policy "Social links visible to the teacher and accepted guardians"
  on public.teacher_social_links for select
  to authenticated
  using (
    (select auth.uid()) = teacher_id
    or exists (
      select 1 from public.contact_requests r
      where r.status = 'accepted'
        and r.teacher_id = teacher_social_links.teacher_id
        and r.guardian_id = (select auth.uid())
    )
  );

-- Expiração (pg_cron) ---------------------------------------------------------------------------

create function public.expire_contact_requests()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.contact_requests
  set status = 'expired'
  where status = 'pending' and expires_at <= now();
$$;

revoke execute on function public.expire_contact_requests() from public, anon, authenticated;

select cron.schedule(
  'expire-contact-requests',
  '*/15 * * * *',
  'select public.expire_contact_requests()'
);
