import type {
  DayPeriod,
  EducationLevel,
  NamedItem,
  PublicTeacherProfile,
  TutoringType,
} from './types';

// Regras puras do perfil público: rótulos em pt-BR e o mapeamento da linha do banco para o modelo
// que a tela usa. Sem React e sem Supabase, para testar com facilidade.

export const TUTORING_TYPE_LABELS: Record<TutoringType, string> = {
  online: 'Online',
  in_person: 'Presencial',
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  elementary_early: 'Fundamental I (1º ao 5º ano)',
  elementary_late: 'Fundamental II (6º ao 9º ano)',
  high_school: 'Ensino médio',
};

export const PERIOD_LABELS: Record<DayPeriod, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  evening: 'Noite',
};

// 0 = domingo ... 6 = sábado (mesma numeração do banco e do Date.getDay()).
export const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** As rotas provisórias navegam com ids de exemplo; um id que não é uuid nunca existe no banco. */
export function isValidTeacherId(id: string): boolean {
  return UUID_PATTERN.test(id);
}

/** "Centro · São Paulo/SP", pulando o que não foi preenchido. */
export function formatLocation(
  neighborhood: string | null,
  cityName: string | null,
  state: string | null,
): string | null {
  const city = cityName ? (state ? `${cityName}/${state}` : cityName) : null;
  const parts = [neighborhood, city].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(' · ') : null;
}

/** Dias da semana em ordem, sem repetição, ignorando números fora de 0 a 6. */
export function formatWeekdays(weekdays: number[]): string[] {
  return [...new Set(weekdays)]
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((a, b) => a - b)
    .map((day) => WEEKDAY_LABELS[day]);
}

const PERIOD_ORDER: DayPeriod[] = ['morning', 'afternoon', 'evening'];

export function formatPeriods(periods: DayPeriod[]): string[] {
  return PERIOD_ORDER.filter((period) => periods.includes(period)).map(
    (period) => PERIOD_LABELS[period],
  );
}

const EDUCATION_ORDER: EducationLevel[] = ['elementary_early', 'elementary_late', 'high_school'];

export function formatEducationLevels(levels: EducationLevel[]): string[] {
  return EDUCATION_ORDER.filter((level) => levels.includes(level)).map(
    (level) => EDUCATION_LEVEL_LABELS[level],
  );
}

export function formatTutoringTypes(types: TutoringType[]): string[] {
  return (['online', 'in_person'] as TutoringType[])
    .filter((type) => types.includes(type))
    .map((type) => TUTORING_TYPE_LABELS[type]);
}

/** Texto do resumo de avaliações (RF06). */
export function formatRatingSummary(ratingCount: number): string {
  if (ratingCount <= 0) return 'Ainda sem avaliações';
  return ratingCount === 1 ? '1 avaliação' : `${ratingCount} avaliações`;
}

// Forma da linha devolvida pela consulta de api.ts (colunas + tabelas embutidas).
export type PublicTeacherRow = {
  id: string;
  bio: string | null;
  hourly_rate_cents: number | null;
  tutoring_types: TutoringType[];
  education_levels: EducationLevel[];
  available_weekdays: number[];
  available_periods: DayPeriod[];
  neighborhood: string | null;
  state: PublicTeacherProfile['state'];
  rating_average: number | null;
  rating_count: number;
  profiles: { full_name: string; avatar_url: string | null } | null;
  cities: { name: string } | null;
  teacher_subjects: { subjects: (NamedItem & { sort_order: number }) | null }[];
  teacher_languages: { languages: (NamedItem & { sort_order: number }) | null }[];
};

function sortedItems(rows: ({ sort_order: number } & NamedItem)[]): NamedItem[] {
  return [...rows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(({ id, name }) => ({ id, name }));
}

export function toPublicTeacherProfile(row: PublicTeacherRow): PublicTeacherProfile {
  return {
    id: row.id,
    fullName: row.profiles?.full_name ?? 'Professor',
    avatarUrl: row.profiles?.avatar_url ?? null,
    bio: row.bio?.trim() ? row.bio.trim() : null,
    hourlyRateCents: row.hourly_rate_cents,
    tutoringTypes: row.tutoring_types,
    educationLevels: row.education_levels,
    weekdays: row.available_weekdays,
    periods: row.available_periods,
    neighborhood: row.neighborhood,
    cityName: row.cities?.name ?? null,
    state: row.state,
    subjects: sortedItems(
      row.teacher_subjects.flatMap((item) => (item.subjects ? [item.subjects] : [])),
    ),
    languages: sortedItems(
      row.teacher_languages.flatMap((item) => (item.languages ? [item.languages] : [])),
    ),
    ratingAverage: row.rating_average,
    ratingCount: row.rating_count,
  };
}

/** Link exibido sem o protocolo e o "www." (ex.: "instagram.com/profa.ana"). */
export function formatSocialLink(url: string): string {
  return url
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');
}

/** Mensagem inicial do WhatsApp aberta pelo responsável no perfil do professor (RF10). */
export function buildTeacherContactMessage(
  teacherName: string,
  guardianName?: string | null,
): string {
  const teacherFirstName = teacherName.trim().split(/\s+/)[0] || 'professor(a)';
  const guardian = guardianName?.trim();
  return guardian
    ? `Olá, ${teacherFirstName}! Sou ${guardian} e falei com você pelo Destrava.`
    : `Olá, ${teacherFirstName}! Falei com você pelo Destrava.`;
}
