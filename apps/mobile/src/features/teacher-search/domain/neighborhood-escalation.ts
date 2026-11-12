import type { TeacherSearchResultRow } from '../types';

export function normalizeText(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Extrai a lista de bairros únicos (ordenados alfabeticamente) a partir
 * dos professores já cadastrados e publicados naquela cidade.
 */
export function extractAvailableNeighborhoods(
  teachers: readonly TeacherSearchResultRow[],
): string[] {
  const seen = new Map<string, string>();

  for (const teacher of teachers) {
    const raw = teacher.neighborhood?.trim();
    if (!raw) continue;
    const key = normalizeText(raw);
    if (key && !seen.has(key)) {
      seen.set(key, raw);
    }
  }

  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/**
 * Escalona os resultados da busca:
 * - Quando nenhum bairro é selecionado, mantém a ordem original do banco (nota média DESC).
 * - Quando bairros são selecionados:
 *   - No modo 'prioritize' (padrão): traz primeiro os professores do(s) bairro(s) selecionado(s)
 *     e em seguida os demais professores da mesma cidade.
 *   - No modo 'strict': filtra apenas os professores do(s) bairro(s) selecionado(s).
 */
export function escalateTeachersByNeighborhood(
  teachers: readonly TeacherSearchResultRow[],
  selectedNeighborhoods: readonly string[],
  mode: 'prioritize' | 'strict' = 'prioritize',
): TeacherSearchResultRow[] {
  const normalizedSelected = new Set(selectedNeighborhoods.map(normalizeText).filter(Boolean));

  if (normalizedSelected.size === 0) {
    return [...teachers];
  }

  const inSelectedNeighborhood: TeacherSearchResultRow[] = [];
  const inRestOfCity: TeacherSearchResultRow[] = [];

  for (const teacher of teachers) {
    const teacherNeighborhood = normalizeText(teacher.neighborhood);
    if (teacherNeighborhood && normalizedSelected.has(teacherNeighborhood)) {
      inSelectedNeighborhood.push(teacher);
    } else {
      inRestOfCity.push(teacher);
    }
  }

  if (mode === 'strict') {
    return inSelectedNeighborhood;
  }

  return [...inSelectedNeighborhood, ...inRestOfCity];
}

/**
 * Conta quantos filtros ativos o usuário aplicou (para exibir o badge no botão "Filtros").
 */
export function countActiveFilters(filters: {
  subjectIds: readonly string[];
  languageIds: readonly string[];
  tutoringTypes: readonly string[];
  minHourlyRateCents: number | null;
  maxHourlyRateCents: number | null;
  weekdays: readonly number[];
  neighborhoods?: readonly string[];
}): number {
  let count = 0;
  if (filters.subjectIds.length > 0) count += 1;
  if (filters.languageIds.length > 0) count += 1;
  if (filters.tutoringTypes.length > 0) count += 1;
  if (filters.minHourlyRateCents !== null || filters.maxHourlyRateCents !== null) {
    count += 1;
  }
  if (filters.weekdays.length > 0) count += 1;
  if (filters.neighborhoods && filters.neighborhoods.length > 0) count += 1;
  return count;
}
