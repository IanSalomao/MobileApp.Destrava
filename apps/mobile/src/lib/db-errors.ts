// Erros de regra de negócio do banco chegam como `raise exception '<codigo>'`, e o supabase-js os
// expõe em error.message (com os detalhes em error.details). Cada feature passa o próprio mapa de
// código -> mensagem em pt-BR; o fallback cobre rede e erros inesperados.

const GENERIC_FALLBACK = 'Não foi possível concluir agora. Verifique sua conexão e tente de novo.';

type DbError = {
  message?: string;
  details?: string | null;
};

/** Código do erro (a mensagem do raise exception), ou null. */
export function getDbErrorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null) {
    const { message } = error as DbError;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return null;
}

/** Detalhe do erro (ex.: lista de campos faltando em teacher_profile_incomplete). */
export function getDbErrorDetails(error: unknown): string | null {
  if (typeof error === 'object' && error !== null) {
    const { details } = error as DbError;
    if (typeof details === 'string' && details.length > 0) return details;
  }
  return null;
}

export function translateDbError(
  error: unknown,
  map: Record<string, string>,
  fallback: string = GENERIC_FALLBACK,
): string {
  const code = getDbErrorCode(error);
  return (code && map[code]) ?? fallback;
}
