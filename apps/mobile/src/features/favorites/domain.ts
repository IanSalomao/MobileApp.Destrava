import type { FavoriteTeacher } from './types';

// Regras puras de favoritos, sem React nem Supabase.

/** Lista de ids depois de favoritar ou desfavoritar, sem repetir (usada na atualização otimista). */
export function applyFavoriteToggle(
  ids: readonly string[],
  teacherId: string,
  isFavorite: boolean,
): string[] {
  if (isFavorite) return ids.filter((id) => id !== teacherId);
  return ids.includes(teacherId) ? [...ids] : [...ids, teacherId];
}

// Forma da linha devolvida pela consulta de api.ts (favorito + professor embutido).
export type FavoriteRow = {
  created_at: string;
  teachers: {
    id: string;
    hourly_rate_cents: number | null;
    rating_average: number | null;
    rating_count: number;
    profiles: { full_name: string; avatar_url: string | null } | null;
    teacher_subjects: { subjects: { name: string; sort_order: number } | null }[];
  } | null;
};

/**
 * Converte as linhas do banco na lista da tela. Descarta favoritos cujo professor deixou de estar
 * visível (a RLS devolve o professor nulo, por exemplo se a assinatura expirou).
 */
export function toFavoriteTeachers(rows: FavoriteRow[]): FavoriteTeacher[] {
  return rows.flatMap((row) => {
    const teacher = row.teachers;
    if (!teacher) return [];

    const subjects = teacher.teacher_subjects
      .flatMap((item) => (item.subjects ? [item.subjects] : []))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((subject) => subject.name);

    return [
      {
        id: teacher.id,
        fullName: teacher.profiles?.full_name ?? 'Professor',
        avatarUrl: teacher.profiles?.avatar_url ?? null,
        subjects,
        hourlyRateCents: teacher.hourly_rate_cents ?? 0,
        ratingAverage: teacher.rating_average,
        ratingCount: teacher.rating_count,
      },
    ];
  });
}
