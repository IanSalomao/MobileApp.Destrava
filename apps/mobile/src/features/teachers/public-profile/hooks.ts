import { skipToken, useQuery } from '@tanstack/react-query';

import { getPublicTeacherProfile } from './api';

export const publicTeacherKeys = {
  all: ['teachers', 'public-profile'] as const,
  detail: (teacherId: string) => [...publicTeacherKeys.all, teacherId] as const,
};

/** Perfil público do professor. Não busca nada enquanto não houver id na rota. */
export function usePublicTeacherProfile(teacherId: string | undefined) {
  return useQuery({
    queryKey: publicTeacherKeys.detail(teacherId ?? 'unknown'),
    queryFn: teacherId ? () => getPublicTeacherProfile(teacherId) : skipToken,
  });
}
