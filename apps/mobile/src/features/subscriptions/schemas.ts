import { z } from 'zod';

import { onlyDigits } from '@/lib/masks';

// Validação dos campos do cartão. CVV e nome são conferidos aqui, mas NÃO vão ao banco (cobrança
// simulada): só servem para o usuário preencher um cartão plausível.

function isNotExpired(expiry: string): boolean {
  const digits = onlyDigits(expiry);
  if (digits.length !== 4) return false;
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2, 4));
  if (month < 1 || month > 12) return false;
  const firstOfNextMonth = new Date(year, month, 1);
  return firstOfNextMonth.getTime() > Date.now();
}

export const cardSchema = z.object({
  number: z
    .string()
    .refine((value) => onlyDigits(value).length >= 13 && onlyDigits(value).length <= 19, {
      message: 'Informe um número de cartão válido.',
    }),
  expiry: z.string().refine(isNotExpired, { message: 'Validade inválida ou vencida.' }),
  cvv: z
    .string()
    .refine((value) => onlyDigits(value).length >= 3 && onlyDigits(value).length <= 4, {
      message: 'CVV inválido.',
    }),
  holderName: z.string().trim().min(2, 'Informe o nome como está no cartão.'),
});

export type CardInput = z.infer<typeof cardSchema>;
