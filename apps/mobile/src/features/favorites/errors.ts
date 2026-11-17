import { translateDbError } from '@/lib/db-errors';

// Falhas ao favoritar: a RLS recusa professor que não está mais publicado. O resto cai na
// mensagem genérica (rede e erros inesperados).
const FAVORITE_ERROR_MESSAGES: Record<string, string> = {
  'new row violates row-level security policy for table "favorite_teachers"':
    'Este professor não está mais disponível.',
};

export function getFavoriteErrorMessage(error: unknown): string {
  return translateDbError(error, FAVORITE_ERROR_MESSAGES);
}
