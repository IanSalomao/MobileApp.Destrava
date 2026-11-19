import { supabase } from '@/lib/supabase';

import { getLaunchPlan, getMySubscription, startSubscription } from './api';

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

  it('propagam o erro do Supabase', async () => {
    const error = new Error('falha');
    mockQuery({ error });
    await expect(getLaunchPlan()).rejects.toBe(error);
    await expect(getMySubscription('t1')).rejects.toBe(error);
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

  it('propagam o erro do banco', async () => {
    const error = { message: 'subscription_not_active' };
    mockRpc.mockResolvedValue({ data: null, error });
    await expect(startSubscription({ planId: 'teacher_launch' })).rejects.toBe(error);
  });
});
