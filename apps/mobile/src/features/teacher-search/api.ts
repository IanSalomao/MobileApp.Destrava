import { supabase } from '@/lib/supabase';

import type { SearchTeachersParams, SearchTeachersRpcArgs, TeacherSearchResultRow } from './types';

export const DEFAULT_PAGE_SIZE = 20;

export async function searchTeachers(
  params: SearchTeachersParams = {},
): Promise<TeacherSearchResultRow[]> {
  const args: SearchTeachersRpcArgs = {
    p_city_id: params.cityId ?? undefined,
    p_state: params.state ?? undefined,
    p_query: params.query?.trim() ? params.query.trim() : undefined,
    p_subject_ids:
      params.subjectIds && params.subjectIds.length > 0 ? params.subjectIds : undefined,
    p_language_ids:
      params.languageIds && params.languageIds.length > 0 ? params.languageIds : undefined,
    p_tutoring_types:
      params.tutoringTypes && params.tutoringTypes.length > 0 ? params.tutoringTypes : undefined,
    p_min_hourly_rate_cents: params.minHourlyRateCents ?? undefined,
    p_max_hourly_rate_cents: params.maxHourlyRateCents ?? undefined,
    p_weekdays: params.weekdays && params.weekdays.length > 0 ? params.weekdays : undefined,
    p_limit: params.limit ?? DEFAULT_PAGE_SIZE,
    p_offset: params.offset ?? 0,
  };

  const { data, error } = await supabase.rpc('search_teachers', args);

  if (error) throw error;
  return data ?? [];
}
