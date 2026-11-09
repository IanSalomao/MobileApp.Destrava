import { skipToken, useQuery } from '@tanstack/react-query';

import { listCities, listLanguages, listSubjects } from './api';
import type { BrazilianState } from './types';

// O catálogo muda raramente (só por migração), então fica em cache por bastante tempo.
const CATALOG_STALE_TIME = 1000 * 60 * 60; // 1 h

export const catalogKeys = {
  subjects: ['catalog', 'subjects'] as const,
  languages: ['catalog', 'languages'] as const,
  cities: (state: BrazilianState | null) => ['catalog', 'cities', state] as const,
};

/** Lista de matérias do catálogo. */
export function useSubjects() {
  return useQuery({
    queryKey: catalogKeys.subjects,
    queryFn: listSubjects,
    staleTime: CATALOG_STALE_TIME,
  });
}

/** Lista de idiomas do catálogo. */
export function useLanguages() {
  return useQuery({
    queryKey: catalogKeys.languages,
    queryFn: listLanguages,
    staleTime: CATALOG_STALE_TIME,
  });
}

/** Municípios do estado escolhido. Não busca nada enquanto não houver estado. */
export function useCities(state: BrazilianState | null | undefined) {
  return useQuery({
    queryKey: catalogKeys.cities(state ?? null),
    queryFn: state ? () => listCities(state) : skipToken,
    staleTime: CATALOG_STALE_TIME,
  });
}
