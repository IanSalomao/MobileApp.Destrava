import { maskPhoneBR } from '@/lib/masks';

// Regras puras do perfil. Sem React e sem Supabase.

const BR_PREFIX = '+55';

/**
 * Celular salvo no banco (E.164, ex.: +5511999991234) no formato do campo da tela:
 * "(11) 99999-1234". Sem número salvo, o campo começa vazio.
 */
export function toPhoneInput(e164: string | null | undefined): string {
  if (!e164) return '';
  const national = e164.startsWith(BR_PREFIX) ? e164.slice(BR_PREFIX.length) : e164;
  return maskPhoneBR(national);
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

/**
 * Linha embaixo do nome no "Meu perfil": "Responsável por Gabriel". Com mais de um aluno, cita o
 * primeiro e quantos mais há; sem aluno, fica só "Responsável".
 */
export function formatGuardianSubtitle(studentNames: readonly string[]): string {
  const names = studentNames.map(firstName).filter(Boolean);
  if (names.length === 0) return 'Responsável';
  if (names.length === 1) return `Responsável por ${names[0]}`;
  return `Responsável por ${names[0]} e mais ${names.length - 1}`;
}

/**
 * A foto sobe sempre no mesmo caminho (avatars/<user_id>/avatar.<ext>), então a URL pública não
 * muda. O parâmetro de versão força o aparelho a baixar a foto nova em vez de usar o cache.
 */
export function withAvatarVersion(publicUrl: string, version: number): string {
  const separator = publicUrl.includes('?') ? '&' : '?';
  return `${publicUrl}${separator}v=${version}`;
}
