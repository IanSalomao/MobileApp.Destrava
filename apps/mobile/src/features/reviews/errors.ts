import { translateDbError } from '@/lib/db-errors';

// Erros das avaliações (RF12). O Postgres devolve o código em error.code:
// - 42501: o RLS recusou o insert (o responsável não tem solicitação aceita com o professor);
// - 23505: já existe avaliação do par (por exemplo, enviada de outro aparelho);
// - 23514: check da tabela (nota fora de 1 a 5 ou comentário longo demais).
const INSUFFICIENT_PRIVILEGE = '42501';
const UNIQUE_VIOLATION = '23505';
const CHECK_VIOLATION = '23514';

export const REVIEW_NOT_ALLOWED_MESSAGE =
  'Você só pode avaliar um professor depois que ele aceitar uma solicitação de contato sua.';

const REVIEW_ERROR_MESSAGES: Record<string, string> = {
  review_not_found: 'Não encontramos sua avaliação. Volte e abra a tela de novo.',
};

function getPostgresCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null) {
    const { code } = error as { code?: unknown };
    if (typeof code === 'string') return code;
  }
  return null;
}

/** Mensagem em pt-BR para uma falha ao carregar ou salvar a avaliação. */
export function getReviewErrorMessage(error: unknown): string {
  switch (getPostgresCode(error)) {
    case INSUFFICIENT_PRIVILEGE:
      return REVIEW_NOT_ALLOWED_MESSAGE;
    case UNIQUE_VIOLATION:
      return 'Você já avaliou este professor. Volte e abra a tela de novo para editar a avaliação.';
    case CHECK_VIOLATION:
      return 'Escolha uma nota de 1 a 5 e use no máximo 1000 caracteres no comentário.';
    default:
      return translateDbError(error, REVIEW_ERROR_MESSAGES);
  }
}
