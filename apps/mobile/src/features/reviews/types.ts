import type { Tables } from '@/lib/database.types';

// Avaliação de um professor (RF12), no formato que as telas usam. O nome exibido ("Camila S.") é
// gerado pelo banco em reviewer_name; o app nunca mostra o nome completo de quem avaliou.
export type Review = Readonly<{
  id: string;
  teacherId: string;
  /** Nota de 1 a 5. */
  rating: number;
  comment: string | null;
  reviewerName: string;
  createdAt: string;
  updatedAt: string;
}>;

// Linha de reviews como as consultas de api.ts leem (sem guardian_id: a lista pública não precisa
// saber quem escreveu além do nome exibido).
export type ReviewRow = Pick<
  Tables<'reviews'>,
  'id' | 'teacher_id' | 'rating' | 'comment' | 'reviewer_name' | 'created_at' | 'updated_at'
>;

/** O que o responsável envia: só a nota e o comentário. guardian_id vem de auth.uid() no banco. */
export type ReviewValues = Readonly<{
  rating: number;
  comment: string | null;
}>;

/** Uma página da lista "Ver todas as avaliações", da mais recente para a mais antiga. */
export type TeacherReviewsPage = Readonly<{
  reviews: Review[];
  /** Página seguinte (começa em 0), ou null quando esta é a última. */
  nextPage: number | null;
}>;
