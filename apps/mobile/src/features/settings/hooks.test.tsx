import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { clearAppCache, getCacheSizeBytes } from '@/lib/cache';

import { settingsKeys, useCacheSize, useClearCache } from './hooks';

jest.mock('@/lib/cache', () => ({
  getCacheSizeBytes: jest.fn(),
  clearAppCache: jest.fn(),
}));

const mockGetCacheSizeBytes = getCacheSizeBytes as jest.MockedFunction<typeof getCacheSizeBytes>;
const mockClearAppCache = clearAppCache as jest.MockedFunction<typeof clearAppCache>;

function createWrapper(
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useCacheSize', () => {
  afterEach(() => jest.clearAllMocks());

  it('expõe o tamanho do cache', async () => {
    mockGetCacheSizeBytes.mockResolvedValue(2048);

    const { result } = await renderHook(() => useCacheSize(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(2048);
    expect(result.current.errorMessage).toBeNull();
  });

  it('traduz o erro do cálculo do cache', async () => {
    mockGetCacheSizeBytes.mockRejectedValue(new Error('boom'));

    const { result } = await renderHook(() => useCacheSize(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorMessage).toBe('Não foi possível calcular o tamanho do cache.');
  });
});

describe('useClearCache', () => {
  afterEach(() => jest.clearAllMocks());

  it('limpa o cache e invalida o tamanho exibido', async () => {
    mockClearAppCache.mockResolvedValue(undefined);

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidate = jest.spyOn(client, 'invalidateQueries');

    const { result } = await renderHook(() => useClearCache(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockClearAppCache).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: settingsKeys.cacheSize });
  });

  it('traduz o erro da limpeza', async () => {
    mockClearAppCache.mockRejectedValue(new Error('boom'));

    const { result } = await renderHook(() => useClearCache(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorMessage).toBe('Não foi possível limpar o cache. Tente novamente.');
  });
});
