import type { Tables } from '@/lib/database.types';

export type SubscriptionPlan = Pick<
  Tables<'subscription_plans'>,
  'id' | 'name' | 'price_cents' | 'trial_days'
>;

export type Subscription = Tables<'subscriptions'>;

export type SubscriptionPayment = Pick<
  Tables<'subscription_payments'>,
  'id' | 'amount_cents' | 'period_start' | 'period_end' | 'card_brand' | 'card_last4' | 'paid_at'
>;
