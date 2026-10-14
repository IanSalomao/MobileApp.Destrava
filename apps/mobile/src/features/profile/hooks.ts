import { skipToken, useQuery } from '@tanstack/react-query';

import { useSession } from '@/features/auth/session-provider';

import { getProfile } from './api';

export const profileKeys = {
  all: ['profiles'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
};

/** Perfil do usuário logado. Fica desabilitado enquanto não há sessão. */
export function useMyProfile() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: profileKeys.detail(userId ?? 'anonymous'),
    queryFn: userId ? () => getProfile(userId) : skipToken,
  });
}
