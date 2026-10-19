import { useQuery } from '@tanstack/react-query';

import { listSubjects } from './api';

// ViewModels da feature: estado da tela via TanStack Query.
// As chaves de query ficam reunidas num objeto para reaproveitar e invalidar.
export const subjectKeys = {
  all: ['subjects'] as const,
};

/** Lista de matérias do catálogo. Fica em cache: o catálogo muda raramente. */
export function useSubjects() {
  return useQuery({
    queryKey: subjectKeys.all,
    queryFn: listSubjects,
    staleTime: 1000 * 60 * 60, // 1 h
  });
}
