import { skipToken, useQuery } from '@tanstack/react-query';

import { getPublicTeacherProfile, getTeacherContact } from './api';

export const publicTeacherKeys = {
  all: ['teachers', 'public-profile'] as const,
  detail: (teacherId: string) => [...publicTeacherKeys.all, teacherId] as const,
  contact: (teacherId: string) => [...publicTeacherKeys.all, teacherId, 'contact'] as const,
};

/** Perfil público do professor. Não busca nada enquanto não houver id na rota. */
export function usePublicTeacherProfile(teacherId: string | undefined) {
  return useQuery({
    queryKey: publicTeacherKeys.detail(teacherId ?? 'unknown'),
    queryFn: teacherId ? () => getPublicTeacherProfile(teacherId) : skipToken,
  });
}

/** Situação do contato com o professor (sem pedido, pendente ou aceito com WhatsApp e rede social). */
export function useTeacherContact(teacherId: string | undefined) {
  return useQuery({
    queryKey: publicTeacherKeys.contact(teacherId ?? 'unknown'),
    queryFn: teacherId ? () => getTeacherContact(teacherId) : skipToken,
  });
}
