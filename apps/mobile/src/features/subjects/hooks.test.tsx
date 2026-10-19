import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import * as api from './api';
import { useSubjects } from './hooks';

// Camada de ViewModel: testamos o hook mockando a camada de dados (api.ts).
// A fábrica substitui o módulo sem carregar o real (que puxaria o Supabase).
jest.mock('./api', () => ({ listSubjects: jest.fn() }));

const mockListSubjects = api.listSubjects as jest.MockedFunction<typeof api.listSubjects>;

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

    const { result } = renderHook(() => useSubjects(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
  });

  it('entra em estado de erro quando a camada de dados falha', async () => {
    mockListSubjects.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useSubjects(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
