import { onlyDigits } from './masks';

export function buildWhatsAppUrl(phoneE164: string, message: string): string | null {
  const digits = onlyDigits(phoneE164);
  if (digits.length < 10) return null;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
