import type { TablesInsert } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

import { getPageRange, REVIEWS_PAGE_SIZE, toReview } from './domain';
import type { Review, ReviewValues, TeacherReviewsPage } from './types';

// Model/repositório das avaliações (RF12): único lugar que fala com o Supabase. guardian_id vem do
// default auth.uid() e nunca é enviado. O RLS só deixa avaliar quem tem uma solicitação aceita
// com o professor e só deixa editar a própria avaliação. Deixa o erro do Supabase subir (quem
// traduz é o hook).

const REVIEW_COLUMNS = 'id, teacher_id, rating, comment, reviewer_name, created_at, updated_at';

/** Avaliação que o responsável já fez para o professor, ou null (uma por par). */
export async function getMyReview(guardianId: string, teacherId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_COLUMNS)
    .eq('guardian_id', guardianId)
    .eq('teacher_id', teacherId)
    .maybeSingle();

  if (error) throw error;
  return data ? toReview(data) : null;
}

/** Primeira avaliação do par responsável/professor. */
export async function createReview(teacherId: string, values: ReviewValues): Promise<Review> {
  // Só as colunas liberadas pelo grant insert. reviewer_name sai do trigger set_reviewer_name,
  // mas o tipo gerado marca a coluna como obrigatória (not null sem default), daí o cast.
  const row = {
    teacher_id: teacherId,
    rating: values.rating,
    comment: values.comment,
  } as TablesInsert<'reviews'>;

  const { data, error } = await supabase
    .from('reviews')
    .insert(row)
    .select(REVIEW_COLUMNS)
    .single();

  if (error) throw error;
  return toReview(data);
}

/** Edita a nota e o comentário. Sem linha devolvida (removida ou de outra pessoa): review_not_found. */
export async function updateReview(reviewId: string, values: ReviewValues): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .update({ rating: values.rating, comment: values.comment })
    .eq('id', reviewId)
    .select(REVIEW_COLUMNS)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('review_not_found');
  return toReview(data);
}

/**
 * Uma página das avaliações do professor, da mais recente para a mais antiga (lista "Ver todas as
 * avaliações"). `page` começa em 0. Usa o índice (teacher_id, created_at desc).
 */
export async function listTeacherReviews(
  teacherId: string,
  page: number = 0,
  pageSize: number = REVIEWS_PAGE_SIZE,
): Promise<TeacherReviewsPage> {
  const range = getPageRange(page, pageSize);
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_COLUMNS)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
    // Desempate estável: avaliações do mesmo instante não se repetem nem somem entre páginas.
    .order('id', { ascending: false })
    .range(range.from, range.to);

  if (error) throw error;

  const hasMore = data.length > pageSize;
  return {
    reviews: data.slice(0, pageSize).map(toReview),
    nextPage: hasMore ? range.page + 1 : null,
  };
}
