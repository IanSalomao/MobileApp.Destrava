import { z } from 'zod';

import { COMMENT_MAX_LENGTH, MAX_RATING, MIN_RATING } from './domain';

// Formulário "Avaliar professor" (RF12): nota de 1 a 5 obrigatória e comentário opcional. A nota
// começa em 0 (nenhuma estrela marcada) e só passa na validação depois de escolhida.
export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(MIN_RATING, 'Escolha uma nota de 1 a 5 estrelas.')
    .max(MAX_RATING, 'Escolha uma nota de 1 a 5 estrelas.'),
  comment: z
    .string()
    .trim()
    .max(COMMENT_MAX_LENGTH, `Use no máximo ${COMMENT_MAX_LENGTH} caracteres.`),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
