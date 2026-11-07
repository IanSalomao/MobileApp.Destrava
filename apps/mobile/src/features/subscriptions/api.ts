import { supabase } from '@/lib/supabase';

import type { CardPayload } from './card';
import type { SubscriptionPlan } from './types';

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
