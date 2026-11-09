import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import * as api from './api';
import { useCities, useLanguages, useSubjects } from './hooks';

// Camada de ViewModel: testamos os hooks mockando a camada de dados (api.ts).
// A fábrica substitui o módulo sem carregar o real (que puxaria o Supabase).
jest.mock('./api', () => ({
  listSubjects: jest.fn(),
  listLanguages: jest.fn(),
  listCities: jest.fn(),
}));

const mockListSubjects = api.listSubjects as jest.MockedFunction<typeof api.listSubjects>;
const mockListLanguages = api.listLanguages as jest.MockedFunction<typeof api.listLanguages>;
const mockListCities = api.listCities as jest.MockedFunction<typeof api.listCities>;

function createWrapper() {
  // Cliente novo por teste, sem retry, para o erro aparecer na hora.
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useSubjects', () => {
  afterEach(() => jest.clearAllMocks());

  it('expõe as matérias quando a query resolve', async () => {
    const data = [{ id: 'math', name: 'Matemática' }];
    mockListSubjects.mockResolvedValue(data);

    const { result } = await renderHook(() => useSubjects(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
  });

  it('entra em estado de erro quando a camada de dados falha', async () => {
    mockListSubjects.mockRejectedValue(new Error('boom'));

    const { result } = await renderHook(() => useSubjects(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useLanguages', () => {
  afterEach(() => jest.clearAllMocks());

  it('expõe os idiomas quando a query resolve', async () => {
    const data = [{ id: 'english', name: 'Inglês' }];
    mockListLanguages.mockResolvedValue(data);

    const { result } = await renderHook(() => useLanguages(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
  });
});

describe('useCities', () => {
  afterEach(() => jest.clearAllMocks());

  it('busca os municípios do estado escolhido', async () => {
    const data = [{ id: 3550308, name: 'São Paulo' }];
    mockListCities.mockResolvedValue(data);

    const { result } = await renderHook(() => useCities('SP'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockListCities).toHaveBeenCalledWith('SP');
  });

  it('não busca nada enquanto não há estado', async () => {
    const { result } = await renderHook(() => useCities(null), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockListCities).not.toHaveBeenCalled();
  });
});
