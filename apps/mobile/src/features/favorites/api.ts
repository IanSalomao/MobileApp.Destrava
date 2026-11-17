import { supabase } from '@/lib/supabase';

import { toFavoriteTeachers, type FavoriteRow } from './domain';
import type { FavoriteTeacher } from './types';

// Model/repositório dos favoritos: único lugar que fala com o Supabase. A RLS garante que cada
// responsável lê e altera só os próprios favoritos; guardian_id vem do default auth.uid().
// Deixa o erro do Supabase subir (quem traduz é o hook).

const FAVORITES_SELECT = `
  created_at,
  teachers (
    id, hourly_rate_cents, rating_average, rating_count,
    profiles ( full_name, avatar_url ),
    teacher_subjects ( subjects ( name, sort_order ) )
  )
`;

/** Ids dos professores favoritados (para pintar o coração em qualquer tela). */
export async function listFavoriteTeacherIds(): Promise<string[]> {
  const { data, error } = await supabase.from('favorite_teachers').select('teacher_id');

  if (error) throw error;
  return data.map((row) => row.teacher_id);
}

/** Favoritos com os dados do card, do mais recente para o mais antigo. */
export async function listFavoriteTeachers(): Promise<FavoriteTeacher[]> {
  const { data, error } = await supabase
    .from('favorite_teachers')
    .select(FAVORITES_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return toFavoriteTeachers(data as unknown as FavoriteRow[]);
}

export async function addFavorite(teacherId: string): Promise<void> {
  const { error } = await supabase.from('favorite_teachers').insert({ teacher_id: teacherId });

  if (error) throw error;
}

export async function removeFavorite(teacherId: string): Promise<void> {
  const { error } = await supabase.from('favorite_teachers').delete().eq('teacher_id', teacherId);

  if (error) throw error;
}
