import { supabase } from '@/lib/supabase';

import { isValidTeacherId, toPublicTeacherProfile, type PublicTeacherRow } from './domain';
import type { PublicTeacherProfile } from './types';

// Model/repositório do perfil público do professor: único lugar que fala com o Supabase. Só lê.
// A RLS já esconde quem não está publicado, então não filtramos is_published aqui. Deixa o erro
// do Supabase subir (quem trata é o hook/tela).

const PUBLIC_PROFILE_SELECT = `
  id, bio, hourly_rate_cents, tutoring_types, education_levels,
  available_weekdays, available_periods, neighborhood, state,
  rating_average, rating_count,
  profiles ( full_name, avatar_url ),
  cities!teachers_city_fkey ( name ),
  teacher_subjects ( subjects ( id, name, sort_order ) ),
  teacher_languages ( languages ( id, name, sort_order ) )
`;

/** Perfil público de um professor, ou null quando não existe (ou não está visível ao usuário). */
export async function getPublicTeacherProfile(
  teacherId: string,
): Promise<PublicTeacherProfile | null> {
  if (!isValidTeacherId(teacherId)) return null;

  const { data, error } = await supabase
    .from('teachers')
    .select(PUBLIC_PROFILE_SELECT)
    .eq('id', teacherId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return toPublicTeacherProfile(data as unknown as PublicTeacherRow);
}
