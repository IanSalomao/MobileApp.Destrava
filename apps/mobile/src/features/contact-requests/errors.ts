import { translateDbError } from '@/lib/db-errors';

// Erros do ciclo da solicitação de contato (aceitar/recusar e carregar o detalhe).
const CONTACT_REQUEST_ERROR_MESSAGES: Record<string, string> = {
  contact_request_not_found: 'Solicitação não encontrada.',
  contact_request_already_answered: 'Esta solicitação já foi respondida.',
  contact_request_expired: 'O prazo para responder esta solicitação expirou.',
  contact_request_invalid_status: 'Não foi possível atualizar a solicitação.',
};

export function getContactRequestErrorMessage(error: unknown): string {
  return translateDbError(error, CONTACT_REQUEST_ERROR_MESSAGES);
}
