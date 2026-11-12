import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clearAppCache, getCacheSizeBytes } from '@/lib/cache';

export const settingsKeys = {
  cacheSize: ['settings', 'cache-size'] as const,
};

export function useCacheSize() {
  const query = useQuery({
    queryKey: settingsKeys.cacheSize,
    queryFn: () => getCacheSizeBytes(),
    staleTime: 1000 * 60,
  });

  return {
    ...query,
    errorMessage: query.error ? 'Não foi possível calcular o tamanho do cache.' : null,
  };
}

export function useClearCache() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => clearAppCache(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.cacheSize }),
  });

  return {
    ...mutation,
    errorMessage: mutation.error ? 'Não foi possível limpar o cache. Tente novamente.' : null,
  };
}
