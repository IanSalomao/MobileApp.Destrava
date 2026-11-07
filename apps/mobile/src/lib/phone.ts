import { onlyDigits } from './masks';

// O celular vai para o signUp em E.164 (ex.: +5511999991234), formato que o trigger handle_new_user
// valida (^\+[1-9][0-9]{7,14}$). Número inválido fica nulo no banco e o usuário corrige no perfil.

const BR_COUNTRY_CODE = '55';

/**
 * Converte um celular brasileiro digitado (com DDD, 10 ou 11 dígitos) para E.164.
 * Retorna null quando não dá para montar um número válido.
 */
export function toE164BR(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length !== 10 && digits.length !== 11) return null;
  return `+${BR_COUNTRY_CODE}${digits}`;
}

/** Valida, sem converter, se o celular tem DDD + número (10 ou 11 dígitos). */
export function isValidBRPhone(value: string): boolean {
  const length = onlyDigits(value).length;
  return length === 10 || length === 11;
}
