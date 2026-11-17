import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/features/auth/session-provider';

import { addFavorite, listFavoriteTeacherIds, listFavoriteTeachers, removeFavorite } from './api';
import { applyFavoriteToggle } from './domain';
import { getFavoriteErrorMessage } from './errors';
import type { ToggleFavoriteVariables } from './types';

// As chaves levam o id do usuário para uma conta nunca enxergar o cache de outra no mesmo aparelho.
export const favoriteKeys = {
  all: (userId: string) => ['favorites', userId] as const,
  ids: (userId: string) => [...favoriteKeys.all(userId), 'ids'] as const,
  list: (userId: string) => [...favoriteKeys.all(userId), 'list'] as const,
};

/** Ids dos favoritos do responsável logado. Uma única consulta serve todos os corações. */
export function useFavoriteIds() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: favoriteKeys.ids(userId ?? 'anonymous'),
    queryFn: userId ? listFavoriteTeacherIds : skipToken,
  });
}

/** Se o professor está nos favoritos. Falso enquanto a lista ainda carrega. */
export function useIsFavorite(teacherId: string): boolean {
  const ids = useFavoriteIds();
  return ids.data?.includes(teacherId) ?? false;
}

/** Lista de Favoritos, com os dados do card. */
export function useFavoriteTeachers() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: favoriteKeys.list(userId ?? 'anonymous'),
    queryFn: userId ? listFavoriteTeachers : skipToken,
  });
}

// Favoritar/desfavoritar com atualização otimista: o coração muda na hora e volta atrás se falhar.
export function useToggleFavorite() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ teacherId, isFavorite }: ToggleFavoriteVariables) =>
      isFavorite ? removeFavorite(teacherId) : addFavorite(teacherId),
    onMutate: async ({ teacherId, isFavorite }) => {
      if (!userId) return undefined;

      const key = favoriteKeys.ids(userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key);
      queryClient.setQueryData<string[]>(key, (current = []) =>
        applyFavoriteToggle(current, teacherId, isFavorite),
      );
      return { key, previous };
    },
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
    },
    onSettled: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: favoriteKeys.all(userId) });
    },
  });

  return {
    ...mutation,
    errorMessage: mutation.error ? getFavoriteErrorMessage(mutation.error) : null,
  };
}
