import { onlyDigits } from '@/lib/masks';

// Cobrança simulada no MVP: o app NUNCA envia o número completo nem o CVV. Deriva aqui a bandeira, os
// últimos 4 dígitos e a validade — o único dado do cartão que vai ao banco (start_subscription).

// Bandeiras aceitas pelo check de subscriptions.card_brand.
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'diners' | 'other';

export type CardPayload = {
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
};

const BRAND_PATTERNS: { brand: CardBrand; pattern: RegExp }[] = [
  { brand: 'visa', pattern: /^4/ },
  { brand: 'mastercard', pattern: /^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/ },
  { brand: 'amex', pattern: /^3[47]/ },
  {
    brand: 'elo',
    pattern: /^(4011|4312|4389|4514|4576|5041|5067|509|6277|6362|6363|650|6516|6550)/,
  },
  { brand: 'hipercard', pattern: /^(606282|3841)/ },
  { brand: 'diners', pattern: /^(30[0-5]|3095|36|38)/ },
];

export function detectCardBrand(number: string): CardBrand {
  const digits = onlyDigits(number);
  return BRAND_PATTERNS.find(({ pattern }) => pattern.test(digits))?.brand ?? 'other';
}

/** Monta o dado do cartão que vai ao banco a partir do número e da validade "MM/AA" digitados. */
export function buildCardPayload(number: string, expiry: string): CardPayload {
  const digits = onlyDigits(number);
  const expDigits = onlyDigits(expiry);
  return {
    brand: detectCardBrand(digits),
    last4: digits.slice(-4),
    expMonth: Number(expDigits.slice(0, 2)),
    expYear: 2000 + Number(expDigits.slice(2, 4)),
  };
}
