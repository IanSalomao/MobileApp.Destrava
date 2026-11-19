import { supabase } from '@/lib/supabase';

import type { CardPayload } from './card';
import type { Subscription, SubscriptionPayment, SubscriptionPlan } from './types';

// Model/repositório da feature: único lugar que fala com o Supabase. A cobrança é simulada no
// servidor (RF13); aqui só chamamos as RPCs e lemos o plano.

export const LAUNCH_PLAN_ID = 'teacher_launch';

/** Plano de lançamento do professor exibido na tela de assinatura. */
export async function getLaunchPlan(): Promise<SubscriptionPlan> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('id, name, price_cents, trial_days')
    .eq('id', LAUNCH_PLAN_ID)
    .single();

  if (error) throw error;
  return data;
}

export type StartSubscriptionInput = {
  planId: string;
  /** Sem cartão = "Continuar sem cartão": o teste expira no fim do período. */
  card?: CardPayload;
};

/** Inicia a assinatura (teste grátis). Só manda bandeira, últimos 4 e validade — nunca o número. */
export async function startSubscription({ planId, card }: StartSubscriptionInput) {
  const { data, error } = await supabase.rpc(
    'start_subscription',
    card
      ? {
          p_plan_id: planId,
          p_card_brand: card.brand,
          p_card_last4: card.last4,
          p_card_exp_month: card.expMonth,
          p_card_exp_year: card.expYear,
        }
      : { p_plan_id: planId },
  );

  if (error) throw error;
  return data;
}

/** Assinatura do professor logado, ou null se ele nunca assinou. */
export async function getMySubscription(teacherId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('teacher_id', teacherId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Cobranças (simuladas) da assinatura, da mais recente para a mais antiga. */
export async function listSubscriptionPayments(
  teacherId: string,
  limit = 12,
): Promise<SubscriptionPayment[]> {
  const { data, error } = await supabase
    .from('subscription_payments')
    .select('id, amount_cents, period_start, period_end, card_brand, card_last4, paid_at')
    .eq('teacher_id', teacherId)
    .order('paid_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/** Troca o cartão de uma assinatura em teste ou ativa. Só bandeira, últimos 4 e validade. */
export async function updateSubscriptionCard(card: CardPayload): Promise<Subscription> {
  const { data, error } = await supabase.rpc('update_subscription_card', {
    p_card_brand: card.brand,
    p_card_last4: card.last4,
    p_card_exp_month: card.expMonth,
    p_card_exp_year: card.expYear,
  });

  if (error) throw error;
  return data;
}

/** Cancela no fim do período: o perfil segue visível até lá. */
export async function cancelSubscription(): Promise<Subscription> {
  const { data, error } = await supabase.rpc('cancel_subscription');
  if (error) throw error;
  return data;
}

/** Desfaz o cancelamento agendado. */
export async function resumeSubscription(): Promise<Subscription> {
  const { data, error } = await supabase.rpc('resume_subscription');
  if (error) throw error;
  return data;
}
