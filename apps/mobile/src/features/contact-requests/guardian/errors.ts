import { translateDbError } from '@/lib/db-errors';

// Violação de índice único: o par responsável/professor já tem uma solicitação pendente ou aceita
// (contact_requests_open_pair_key).
const UNIQUE_VIOLATION = '23505';
// Violação de RLS: professor não publicado, ou usuário que não é responsável.
const INSUFFICIENT_PRIVILEGE = '42501';

function getPostgresCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null) {
    const { code } = error as { code?: unknown };
    if (typeof code === 'string') return code;
  }
  return null;
}

/** Mensagem em pt-BR para uma falha ao enviar a solicitação de contato. */
export function getCreateContactRequestErrorMessage(error: unknown): string {
  switch (getPostgresCode(error)) {
    case UNIQUE_VIOLATION:
      return 'Você já tem uma solicitação em aberto com este professor. Acompanhe em "Minhas solicitações".';
    case INSUFFICIENT_PRIVILEGE:
      return 'Este professor não está disponível para novas solicitações no momento.';
    default:
      return translateDbError(error, {});
  }
}