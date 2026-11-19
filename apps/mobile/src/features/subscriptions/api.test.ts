import { supabase } from '@/lib/supabase';

import {
  cancelSubscription,
  getLaunchPlan,
  getMySubscription,
  listSubscriptionPayments,
  resumeSubscription,
  startSubscription,
  updateSubscriptionCard,
} from './api';

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));

const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;

const CARD = { brand: 'visa' as const, last4: '4242', expMonth: 8, expYear: 2028 };

// Builder encadeável que resolve com o resultado configurado.
function mockQuery(result: { data?: unknown; error?: unknown }) {
  const calls: { method: string; args: unknown[] }[] = [];
  const builder: Record<string, unknown> = {
    then: (resolve: (value: unknown) => unknown) =>
      Promise.resolve({ data: null, error: null, ...result }).then(resolve),
  };
  for (const method of ['select', 'eq', 'order', 'limit', 'single', 'maybeSingle']) {
    builder[method] = (...args: unknown[]) => {
      calls.push({ method, args });
      return builder;
    };
  }
  mockFrom.mockReturnValue(builder);
  return calls;
}

afterEach(() => jest.clearAllMocks());

describe('leituras', () => {
  it('getLaunchPlan lê o plano de lançamento', async () => {
    mockQuery({ data: { id: 'teacher_launch' } });
    await expect(getLaunchPlan()).resolves.toEqual({ id: 'teacher_launch' });
    expect(mockFrom).toHaveBeenCalledWith('subscription_plans');
  });

  it('getMySubscription devolve null quando o professor nunca assinou', async () => {
    mockQuery({ data: null });
    await expect(getMySubscription('t1')).resolves.toBeNull();
    expect(mockFrom).toHaveBeenCalledWith('subscriptions');
  });

  it('listSubscriptionPayments ordena da mais recente para a mais antiga', async () => {
    const calls = mockQuery({ data: [{ id: 'p1' }] });
    await expect(listSubscriptionPayments('t1')).resolves.toEqual([{ id: 'p1' }]);
    expect(calls).toContainEqual({ method: 'order', args: ['paid_at', { ascending: false }] });
    expect(calls).toContainEqual({ method: 'limit', args: [12] });
  });

  it('propagam o erro do Supabase', async () => {
    const error = new Error('falha');
    mockQuery({ error });
    await expect(getLaunchPlan()).rejects.toBe(error);
    await expect(getMySubscription('t1')).rejects.toBe(error);
    await expect(listSubscriptionPayments('t1')).rejects.toBe(error);
  });
});

describe('RPCs', () => {
  it('startSubscription manda só bandeira, últimos 4 e validade', async () => {
    mockRpc.mockResolvedValue({ data: { status: 'trialing' }, error: null });

    await startSubscription({ planId: 'teacher_launch', card: CARD });

    expect(mockRpc).toHaveBeenCalledWith('start_subscription', {
      p_plan_id: 'teacher_launch',
      p_card_brand: 'visa',
      p_card_last4: '4242',
      p_card_exp_month: 8,
      p_card_exp_year: 2028,
    });
  });

  it('startSubscription sem cartão manda só o plano', async () => {
    mockRpc.mockResolvedValue({ data: { status: 'trialing' }, error: null });
    await startSubscription({ planId: 'teacher_launch' });
    expect(mockRpc).toHaveBeenCalledWith('start_subscription', { p_plan_id: 'teacher_launch' });
  });

  it('updateSubscriptionCard troca o cartão', async () => {
    mockRpc.mockResolvedValue({ data: { card_last4: '4242' }, error: null });
    await expect(updateSubscriptionCard(CARD)).resolves.toEqual({ card_last4: '4242' });
    expect(mockRpc).toHaveBeenCalledWith('update_subscription_card', {
      p_card_brand: 'visa',
      p_card_last4: '4242',
      p_card_exp_month: 8,
      p_card_exp_year: 2028,
    });
  });

  it('cancelSubscription e resumeSubscription chamam as RPCs', async () => {
    mockRpc.mockResolvedValue({ data: { cancel_at_period_end: true }, error: null });
    await cancelSubscription();
    expect(mockRpc).toHaveBeenCalledWith('cancel_subscription');

    mockRpc.mockResolvedValue({ data: { cancel_at_period_end: false }, error: null });
    await resumeSubscription();
    expect(mockRpc).toHaveBeenCalledWith('resume_subscription');
  });

  it('propagam o erro do banco', async () => {
    const error = { message: 'subscription_not_active' };
    mockRpc.mockResolvedValue({ data: null, error });
    await expect(startSubscription({ planId: 'teacher_launch' })).rejects.toBe(error);
    await expect(updateSubscriptionCard(CARD)).rejects.toBe(error);
    await expect(cancelSubscription()).rejects.toBe(error);
    await expect(resumeSubscription()).rejects.toBe(error);
  });
});
