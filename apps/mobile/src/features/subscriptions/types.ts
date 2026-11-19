import type { Tables } from '@/lib/database.types';

export type SubscriptionPlan = Pick<
  Tables<'subscription_plans'>,
  'id' | 'name' | 'price_cents' | 'trial_days'
>;

export type Subscription = Tables<'subscriptions'>;
