import { maskCpf, maskCurrencyBRL } from '@/lib/masks';

import type { TeacherProfileInput } from './schemas';
import type { MyTeacherProfile, SocialNetwork, VerificationStatus } from './types';

// Regras puras do perfil profissional (sem React nem Supabase).

export const SOCIAL_NETWORK_LABELS: Record<SocialNetwork, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  website: 'Site',
};

export const SOCIAL_NETWORK_OPTIONS = (Object.keys(SOCIAL_NETWORK_LABELS) as SocialNetwork[]).map(
  (value) => ({ value, label: SOCIAL_NETWORK_LABELS[value] }),
);

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  draft: 'Cadastro incompleto',
  pending_review: 'Em análise',
  approved: 'Perfil verificado',
  rejected: 'Verificação recusada',
};

/**
 * CPF e documento de identidade só mudam antes do envio ou depois de uma recusa (o RLS de
 * teacher_verifications e teacher_documents barra o resto). Nesses casos, salvar também reenvia o
 * perfil para análise.
 */
export function isVerificationEditable(status: VerificationStatus): boolean {
  return status === 'draft' || status === 'rejected';
}

/**
 * Normaliza o link digitado: completa o https:// quando falta e troca http:// por https:// (o
 * banco só aceita https). Devolve string vazia para entrada vazia.
 */
export function normalizeSocialUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https:\/\//i.test(trimmed)) return trimmed;
  if (/^http:\/\//i.test(trimmed)) return trimmed.replace(/^http:\/\//i, 'https://');
  return `https://${trimmed}`;
}

/** Link plausível: https, com domínio (ex.: instagram.com/fulano) e no limite do banco. */
export function isValidSocialUrl(value: string): boolean {
  const url = normalizeSocialUrl(value);
  if (!url || url.length > 300) return false;
  return /^https:\/\/[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i.test(url);
}

/** Valores do formulário a partir do perfil salvo, para editar. */
export function toTeacherProfileFormValues(profile: MyTeacherProfile): TeacherProfileInput {
  const socialLink = profile.socialLinks[0];
  return {
    fullName: profile.fullName,
    cpf: profile.cpf ? maskCpf(profile.cpf) : '',
    // O schema exige estado e cidade; nulos ficam vazios até o professor escolher.
    state: profile.state ?? (undefined as unknown as TeacherProfileInput['state']),
    cityId: profile.cityId ?? (undefined as unknown as number),
    subjectIds: profile.subjects.map((subject) => subject.id),
    languageIds: profile.languages.map((language) => language.id),
    bio: profile.bio ?? '',
    tutoringTypes: profile.tutoringTypes,
    hourlyRate: profile.hourlyRateCents ? maskCurrencyBRL(String(profile.hourlyRateCents)) : '',
    weekdays: profile.weekdays,
    periods: profile.periods,
    socialNetwork: socialLink?.network ?? 'instagram',
    socialUrl: socialLink?.url ?? '',
  };
}
