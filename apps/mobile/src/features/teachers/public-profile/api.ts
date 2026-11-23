import { supabase } from '@/lib/supabase';

import { isValidTeacherId, toPublicTeacherProfile, type PublicTeacherRow } from './domain';
import type { PublicTeacherProfile, TeacherContact, TeacherSocialLink } from './types';

// Model/repositório do perfil público do professor: único lugar que fala com o Supabase. Só lê.
// A RLS já esconde quem não está publicado, então não filtramos is_published aqui. Deixa o erro
// do Supabase subir (quem trata é o hook/tela).

const PUBLIC_PROFILE_SELECT = `
  id, bio, hourly_rate_cents, tutoring_types, education_levels,
  available_weekdays, available_periods, neighborhood, state,
  rating_average, rating_count,
  profiles!teachers_id_fkey ( full_name, avatar_url ),
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

/**
 * Contato do responsável logado com o professor: solicitação em aberto ou aceita (no máximo uma por
 * par) e, se aceita, o celular e a rede social do professor (RF09–RF11). O RLS só devolve as
 * solicitações do próprio responsável.
 */
export async function getTeacherContact(teacherId: string): Promise<TeacherContact> {
  if (!isValidTeacherId(teacherId)) return { status: 'none' };

  const { data: requests, error } = await supabase
    .from('contact_requests')
    .select('id, status')
    .eq('teacher_id', teacherId)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;

  const request = requests[0];
  if (!request) return { status: 'none' };
  if (request.status !== 'accepted') return { status: 'pending', requestId: request.id };

  const [contactResult, linksResult] = await Promise.all([
    supabase.from('contact_details').select('phone').eq('user_id', teacherId).maybeSingle(),
    supabase.from('teacher_social_links').select('network, url').eq('teacher_id', teacherId),
  ]);
  if (contactResult.error) throw contactResult.error;
  if (linksResult.error) throw linksResult.error;

  return {
    status: 'accepted',
    requestId: request.id,
    phone: contactResult.data?.phone ?? null,
    socialLinks: linksResult.data as TeacherSocialLink[],
  };
}
