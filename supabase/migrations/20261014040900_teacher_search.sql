-- Busca de professores (RF03, RF04, RF05): cidade, texto e filtros, com nota, favorito e total
-- para paginação, tudo numa consulta no banco (RNF01). Sem geolocalização (decisão do grupo): a
-- busca filtra por cidade e estado.
--
-- É security definer de propósito: aplica a mesma regra pública do RLS (só professores publicados e
-- só colunas que um visitante pode ver, nada de celular ou rede social) sem o custo de reavaliar o
-- RLS de teachers em cada linha.
--
-- Parâmetros (todos opcionais):
--   p_city/p_state                        busca por cidade (sem diferenciar acento/maiúscula)
--   p_query                               texto livre: nome, "sobre mim" ou nome da matéria
--   p_subject_ids, p_language_ids         alguma das matérias/idiomas (ids de subjects/languages)
--   p_tutoring_types                      online e/ou in_person
--   p_min/max_hourly_rate_cents           faixa de preço
--   p_weekdays                            atende em algum destes dias (0 = domingo). Para
--                                         "Disponível esta semana", envie os dias que faltam.
--   p_limit (máx. 50), p_offset           paginação; total_count traz o total sem paginação
create function public.search_teachers(
  p_city text default null,
  p_state text default null,
  p_query text default null,
  p_subject_ids text[] default null,
  p_language_ids text[] default null,
  p_tutoring_types public.tutoring_type[] default null,
  p_min_hourly_rate_cents integer default null,
  p_max_hourly_rate_cents integer default null,
  p_weekdays smallint[] default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  subject_ids text[],
  language_ids text[],
  education_levels public.education_level[],
  tutoring_types public.tutoring_type[],
  hourly_rate_cents integer,
  neighborhood text,
  city text,
  state text,
  rating_average numeric,
  rating_count integer,
  is_favorite boolean,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with query_pattern as (
    select '%' || public.normalize_search_text(btrim(p_query)) || '%' as pattern
    where nullif(btrim(p_query), '') is not null
  ),
  matches as (
    select
      t.id,
      p.full_name,
      p.avatar_url,
      array(
        select ts.subject_id
        from public.teacher_subjects ts
        join public.subjects s on s.id = ts.subject_id
        where ts.teacher_id = t.id
        order by s.sort_order
      ) as subject_ids,
      array(
        select tl.language_id
        from public.teacher_languages tl
        join public.languages l on l.id = tl.language_id
        where tl.teacher_id = t.id
        order by l.sort_order
      ) as language_ids,
      t.education_levels,
      t.tutoring_types,
      t.hourly_rate_cents,
      t.neighborhood,
      t.city,
      t.state,
      t.rating_average,
      t.rating_count,
      exists (
        select 1 from public.favorite_teachers f
        where f.teacher_id = t.id and f.guardian_id = (select auth.uid())
      ) as is_favorite
    from public.teachers t
    join public.profiles p on p.id = t.id
    left join query_pattern q on true
    where t.is_published
      and (
        p_city is null
        or public.normalize_search_text(t.city) = public.normalize_search_text(btrim(p_city))
      )
      and (p_state is null or t.state = upper(btrim(p_state)))
      and (
        p_subject_ids is null
        or exists (
          select 1 from public.teacher_subjects ts
          where ts.teacher_id = t.id and ts.subject_id = any (p_subject_ids)
        )
      )
      and (
        p_language_ids is null
        or exists (
          select 1 from public.teacher_languages tl
          where tl.teacher_id = t.id and tl.language_id = any (p_language_ids)
        )
      )
      and (p_tutoring_types is null or t.tutoring_types && p_tutoring_types)
      and (p_min_hourly_rate_cents is null or t.hourly_rate_cents >= p_min_hourly_rate_cents)
      and (p_max_hourly_rate_cents is null or t.hourly_rate_cents <= p_max_hourly_rate_cents)
      and (p_weekdays is null or t.available_weekdays && p_weekdays)
      and (
        q.pattern is null
        or public.normalize_search_text(p.full_name) like q.pattern
        or public.normalize_search_text(coalesce(t.bio, '')) like q.pattern
        or exists (
          select 1 from public.teacher_subjects ts
          join public.subjects s on s.id = ts.subject_id
          where ts.teacher_id = t.id and public.normalize_search_text(s.name) like q.pattern
        )
      )
  )
  select m.*, count(*) over () as total_count
  from matches m
  order by m.rating_average desc nulls last, m.rating_count desc, m.id
  limit least(greatest(p_limit, 1), 50)
  offset greatest(p_offset, 0);
$$;

revoke execute on function public.search_teachers(
  text, text, text, text[], text[],
  public.tutoring_type[], integer, integer, smallint[], integer, integer
) from public;
grant execute on function public.search_teachers(
  text, text, text, text[], text[],
  public.tutoring_type[], integer, integer, smallint[], integer, integer
) to anon, authenticated;
