import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { onlyDigits } from './masks';

export function buildWhatsAppUrl(phoneE164: string, message: string): string | null {
  const digits = onlyDigits(phoneE164);
  if (digits.length < 10) return null;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Abre o link do WhatsApp sem tirar o usuário do app:
 * - Web: abre em nova aba com noopener/noreferrer.
 * - Android/iOS: delega ao expo-linking (abre o app do WhatsApp mantendo o Destrava aberto).
 */
export async function openWhatsAppUrl(url: string): Promise<void> {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.open === 'function') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  await Linking.openURL(url);
}
