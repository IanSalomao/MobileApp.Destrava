-- RF03: cadastro e login obrigatórios, sem navegação anônima.
--
-- As migrações anteriores à decisão do RF03 liberavam ao papel anon (só a chave publishable, sem
-- login) a leitura dos professores publicados, das matérias e avaliações deles, do catálogo e a
-- RPC search_teachers. Aqui as políticas passam a valer só para authenticated, sem mudar as
-- regras de cada uma. A migração locations já nasceu assim (cities).
--
-- De quebra, junta as duas políticas de UPDATE de contact_requests numa só (o advisor acusa
-- multiple_permissive_policies), com as mesmas regras em OR.

-- Catálogo --------------------------------------------------------------------------------------

alter policy "Anyone can read subjects" on public.subjects to authenticated;
alter policy "Anyone can read subjects" on public.subjects
  rename to "Signed-in users can read subjects";

alter policy "Anyone can read languages" on public.languages to authenticated;
alter policy "Anyone can read languages" on public.languages
  rename to "Signed-in users can read languages";

alter policy "Anyone can read active plans" on public.subscription_plans to authenticated;
alter policy "Anyone can read active plans" on public.subscription_plans
  rename to "Signed-in users can read active plans";

-- Professores publicados ------------------------------------------------------------------------

alter policy "Profiles visible to owner, published teachers and counterparts"
  on public.profiles to authenticated;

alter policy "Teachers visible when published, to the owner or to contacts"
  on public.teachers to authenticated;

alter policy "Teacher subjects are visible with the teacher"
  on public.teacher_subjects to authenticated;

alter policy "Teacher languages are visible with the teacher"
  on public.teacher_languages to authenticated;

alter policy "Reviews visible for published teachers and to participants"
  on public.reviews to authenticated;

-- Busca e funções auxiliares --------------------------------------------------------------------

revoke execute on function public.search_teachers(
  public.brazilian_state, integer, text, text[], text[],
  public.tutoring_type[], integer, integer, smallint[], integer, integer
) from anon;

-- Sem nenhuma política para anon, as funções do schema private não têm mais uso para ele.
revoke execute on function private.is_guardian(uuid) from anon;
revoke execute on function private.is_published_teacher(uuid) from anon;
revoke usage on schema private from anon;

-- contact_requests: uma política de UPDATE ----------------------------------------------------
-- O professor responde (accepted/declined) e o responsável cancela, sempre enquanto pending. O
-- trigger guard_contact_request_status continua validando a transição.

drop policy "Teachers can answer pending contact requests" on public.contact_requests;
drop policy "Guardians can cancel pending contact requests" on public.contact_requests;

create policy "Participants can update pending contact requests"
  on public.contact_requests for update
  to authenticated
  using (
    status = 'pending'
    and (select auth.uid()) in (teacher_id, guardian_id)
  )
  with check (
    ((select auth.uid()) = teacher_id and status in ('accepted', 'declined'))
    or ((select auth.uid()) = guardian_id and status = 'cancelled')
  );
