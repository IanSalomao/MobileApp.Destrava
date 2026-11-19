import {
  describeNextStep,
  formatBRL,
  formatCardExpiry,
  formatCardLabel,
  getSubscriptionState,
  hasCard,
  isSubscriptionRunning,
} from './domain';
import type { Subscription } from './types';

const BASE: Subscription = {
  teacher_id: 't1',
  plan_id: 'teacher_launch',
  status: 'active',
  trial_ends_at: null,
  current_period_start: '2026-11-01T12:00:00Z',
  current_period_end: '2026-12-01T12:00:00Z',
  cancel_at_period_end: false,
  ended_at: null,
  card_brand: 'visa',
  card_last4: '4242',
  card_exp_month: 8,
  card_exp_year: 2028,
  created_at: '2026-10-01T12:00:00Z',
  updated_at: '2026-11-01T12:00:00Z',
};

describe('getSubscriptionState', () => {
  it('sem assinatura', () => {
    expect(getSubscriptionState(null)).toBe('none');
  });

  it('em teste, ativa e encerrada seguem o status do banco', () => {
    expect(getSubscriptionState({ ...BASE, status: 'trialing' })).toBe('trialing');
    expect(getSubscriptionState(BASE)).toBe('active');
    expect(getSubscriptionState({ ...BASE, status: 'canceled' })).toBe('canceled');
    expect(getSubscriptionState({ ...BASE, status: 'expired' })).toBe('expired');
  });

  it('cancelamento agendado vira "canceling"', () => {
    expect(getSubscriptionState({ ...BASE, cancel_at_period_end: true })).toBe('canceling');
  });
});

describe('isSubscriptionRunning', () => {
  it('teste, ativa e cancelamento agendado mantêm o perfil publicado', () => {
    expect(isSubscriptionRunning('trialing')).toBe(true);
    expect(isSubscriptionRunning('active')).toBe(true);
    expect(isSubscriptionRunning('canceling')).toBe(true);
    expect(isSubscriptionRunning('expired')).toBe(false);
    expect(isSubscriptionRunning('none')).toBe(false);
  });
});

describe('cartão', () => {
  it('formata bandeira, últimos dígitos e validade', () => {
    expect(hasCard(BASE)).toBe(true);
    expect(hasCard({ ...BASE, card_last4: null })).toBe(false);
    expect(hasCard(null)).toBe(false);
    expect(formatCardLabel('mastercard', '1234')).toBe('Mastercard •••• 1234');
    expect(formatCardLabel('desconhecida', '1234')).toBe('Cartão •••• 1234');
    expect(formatCardLabel(null, null)).toBe('Nenhum cartão cadastrado');
    expect(formatCardExpiry(8, 2028)).toBe('08/28');
    expect(formatCardExpiry(null, null)).toBe('');
  });
});

describe('formatBRL', () => {
  it('formata centavos em reais', () => {
    expect(formatBRL(2990)).toBe('29,90');
  });
});

describe('describeNextStep', () => {
  it('cobre cada situação da assinatura', () => {
    expect(describeNextStep(null)).toMatch(/Assine/);
    expect(describeNextStep({ ...BASE, status: 'trialing' })).toMatch(/primeira cobrança/);
    expect(describeNextStep({ ...BASE, status: 'trialing', card_last4: null })).toMatch(
      /Cadastre um cartão/,
    );
    expect(describeNextStep(BASE)).toMatch(/Próxima cobrança/);
    expect(describeNextStep({ ...BASE, cancel_at_period_end: true })).toMatch(/termina em/);
    expect(
      describeNextStep({ ...BASE, status: 'canceled', ended_at: '2026-12-01T12:00:00Z' }),
    ).toMatch(/foi cancelada/);
    expect(describeNextStep({ ...BASE, status: 'expired' })).toMatch(/terminou/);
  });
});
