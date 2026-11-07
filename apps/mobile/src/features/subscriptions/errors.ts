import { translateDbError } from '@/lib/db-errors';

// Erros de regra do banco (RPCs de assinatura), traduzidos pelo error.message.
const SUBSCRIPTION_ERROR_MESSAGES: Record<string, string> = {
  not_a_teacher: 'Apenas professores podem assinar.',
  plan_not_available: 'Este plano não está disponível no momento.',
  card_incomplete: 'Preencha todos os dados do cartão.',
  card_expired: 'O cartão está vencido.',
  card_required: 'Informe um cartão para continuar a assinatura.',
  subscription_already_active: 'Você já tem uma assinatura ativa.',
  subscription_not_active: 'Nenhuma assinatura ativa para alterar.',
};

export function getSubscriptionErrorMessage(error: unknown): string {
  return translateDbError(error, SUBSCRIPTION_ERROR_MESSAGES);
}
