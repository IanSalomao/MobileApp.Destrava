import type { Review, ReviewRow } from './types';

// Regras puras das avaliações (RF12). Sem React e sem Supabase.

/** Limite do comentário, o mesmo do check da coluna reviews.comment. */
export const COMMENT_MAX_LENGTH = 1000;

/** Avaliações por página na lista "Ver todas as avaliações". */
export const REVIEWS_PAGE_SIZE = 10;

export const MIN_RATING = 1;
export const MAX_RATING = 5;

/** Rótulo mostrado embaixo das estrelas depois que o responsável escolhe a nota. */
export const RATING_LABELS: Record<number, string> = {
  1: 'Ruim',
  2: 'Regular',
  3: 'Boa',
  4: 'Muito boa',
  5: 'Excelente',
};

export function getRatingLabel(rating: number): string | null {
  return RATING_LABELS[rating] ?? null;
}

/** Comentário em branco vira null no banco (o comentário é opcional). */
export function normalizeComment(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Primeiro nome para o título "Como foi com Ana?". */
export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || 'o professor';
}

/**
 * Intervalo de linhas da página (0, 1, 2...) para o range() do PostgREST. Pede uma linha a mais
 * que o tamanho da página: se ela vier, existe uma página seguinte.
 */
export function getPageRange(page: number, pageSize: number = REVIEWS_PAGE_SIZE) {
  const safePage = Number.isInteger(page) && page > 0 ? page : 0;
  const from = safePage * pageSize;
  return { page: safePage, from, to: from + pageSize };
}

export function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    rating: row.rating,
    comment: row.comment,
    reviewerName: row.reviewer_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Estrelas da nota para exibição (ex.: 4 → "★★★★☆"). Arredonda e limita entre 0 e 5. */
export function formatStars(rating: number): string {
  const filled = Math.min(MAX_RATING, Math.max(0, Math.round(rating)));
  return '★'.repeat(filled) + '☆'.repeat(MAX_RATING - filled);
}

/** Nota média com vírgula (ex.: 4.85 → "4,9"); "—" sem avaliações. */
export function formatAverage(average: number | null): string {
  return average === null ? '—' : average.toFixed(1).replace('.', ',');
}

/** "1 avaliação" / "12 avaliações". */
export function formatReviewCount(count: number): string {
  return count === 1 ? '1 avaliação' : `${count} avaliações`;
}

/** Data curta da avaliação (ex.: "18 de nov. de 2026"). */
export function formatReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
