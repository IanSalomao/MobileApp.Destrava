import type { Subscription } from './types';

// Regras puras da assinatura (RF13), sem React nem Supabase. A cobrança é simulada no servidor;
// aqui só interpretamos o que o banco devolve para a tela.

/**
 * Situação da assinatura:
 * - trialing / active: em teste ou ativa, renovando no fim do período;
 * - canceling: em teste ou ativa, mas cancelada para o fim do período;
 * - canceled / expired: encerrada (cancelada ou teste sem cartão que acabou);
 * - none: nunca assinou.
 */
export type SubscriptionState =
  'none' | 'trialing' | 'active' | 'canceling' | 'canceled' | 'expired';

export function getSubscriptionState(subscription: Subscription | null): SubscriptionState {
  if (!subscription) return 'none';
  const { status } = subscription;
  if ((status === 'trialing' || status === 'active') && subscription.cancel_at_period_end) {
    return 'canceling';
  }
  return status;
}

/** Em teste ou ativa (inclusive cancelada para o fim do período): perfil segue publicado. */
export function isSubscriptionRunning(state: SubscriptionState): boolean {
  return state === 'trialing' || state === 'active' || state === 'canceling';
}

/** "29,90" a partir de centavos. */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
