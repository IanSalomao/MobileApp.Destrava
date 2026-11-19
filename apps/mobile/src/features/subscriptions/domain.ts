import type { CardBrand } from './card';
import type { Subscription } from './types';

// Regras puras da assinatura (RF13), sem React nem Supabase. A cobrança é simulada no servidor;
// aqui só interpretamos o que o banco devolve para a tela.

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  elo: 'Elo',
  hipercard: 'Hipercard',
  diners: 'Diners',
  other: 'Cartão',
};

/**
 * Situação exibida na tela:
 * - trialing / active: em teste ou ativa, renovando no fim do período;
 * - canceling: em teste ou ativa, mas cancelada para o fim do período (ainda dá para retomar);
 * - canceled / expired: encerrada (cancelada pelo professor ou teste sem cartão que acabou);
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

export const SUBSCRIPTION_STATE_LABELS: Record<SubscriptionState, string> = {
  none: 'Sem assinatura',
  trialing: 'Período de teste',
  active: 'Ativa',
  canceling: 'Cancelamento agendado',
  canceled: 'Cancelada',
  expired: 'Encerrada',
};

export function hasCard(subscription: Subscription | null): boolean {
  return Boolean(subscription?.card_last4);
}

/** "Visa •••• 4242". */
export function formatCardLabel(brand: string | null, last4: string | null): string {
  if (!last4) return 'Nenhum cartão cadastrado';
  const label = CARD_BRAND_LABELS[(brand ?? 'other') as CardBrand] ?? CARD_BRAND_LABELS.other;
  return `${label} •••• ${last4}`;
}

/** "08/28". */
export function formatCardExpiry(month: number | null, year: number | null): string {
  if (!month || !year) return '';
  return `${String(month).padStart(2, '0')}/${String(year % 100).padStart(2, '0')}`;
}

/** "29,90" a partir de centavos. */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** "18 de junho de 2026". */
export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** "18/06/2026". */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

/**
 * Frase sobre o próximo passo da assinatura, a partir da situação e da data de fim do período:
 * próxima cobrança, fim do teste ou data em que o acesso termina.
 */
export function describeNextStep(subscription: Subscription | null): string {
  const state = getSubscriptionState(subscription);
  if (!subscription || state === 'none') {
    return 'Assine para aparecer nas buscas das famílias.';
  }
  const periodEnd = formatLongDate(subscription.current_period_end);
  switch (state) {
    case 'trialing':
      return hasCard(subscription)
        ? `Seu teste grátis vai até ${periodEnd}. A primeira cobrança será nessa data.`
        : `Seu teste grátis vai até ${periodEnd}. Cadastre um cartão para continuar depois disso.`;
    case 'active':
      return `Próxima cobrança em ${periodEnd}.`;
    case 'canceling':
      return `Sua assinatura termina em ${periodEnd}. Até lá, seu perfil continua visível.`;
    case 'canceled':
      return `Sua assinatura foi cancelada em ${formatLongDate(subscription.ended_at ?? subscription.current_period_end)}.`;
    case 'expired':
      return `Sua assinatura terminou em ${formatLongDate(subscription.ended_at ?? subscription.current_period_end)}.`;
  }
}
