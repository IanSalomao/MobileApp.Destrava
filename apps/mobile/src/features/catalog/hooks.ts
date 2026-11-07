import { useQuery } from '@tanstack/react-query';

import { listLanguages } from './api';

export const catalogKeys = {
  languages: ['catalog', 'languages'] as const,
};

/** Lista de idiomas do catálogo. Fica em cache: o catálogo muda raramente. */
export function useLanguages() {
  return useQuery({
    queryKey: catalogKeys.languages,
    queryFn: listLanguages,
    staleTime: 1000 * 60 * 60, // 1 h
  });
}
