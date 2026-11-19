import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import * as api from './api';
import { usePublicTeacherProfile, useTeacherContact } from './hooks';
import type { PublicTeacherProfile } from './types';

// Camada de ViewModel: testamos o hook mockando a camada de dados (api.ts).
jest.mock('./api', () => ({
  getPublicTeacherProfile: jest.fn(),
  getTeacherContact: jest.fn(),
}));

const mockGet = api.getPublicTeacherProfile as jest.MockedFunction<
  typeof api.getPublicTeacherProfile
>;

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

const profile: PublicTeacherProfile = {
  id: 't1',
  fullName: 'Ana Souza',
  avatarUrl: null,
  bio: null,
  hourlyRateCents: 5000,
  tutoringTypes: [],
  educationLevels: [],
  weekdays: [],
  periods: [],
  neighborhood: null,
  cityName: null,
  state: null,
  subjects: [],
  languages: [],
  ratingAverage: null,
  ratingCount: 0,
};

describe('usePublicTeacherProfile', () => {
  afterEach(() => jest.clearAllMocks());

  it('expõe o perfil quando a query resolve', async () => {
    mockGet.mockResolvedValue(profile);

    const { result } = await renderHook(() => usePublicTeacherProfile('t1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(profile);
    expect(mockGet).toHaveBeenCalledWith('t1');
  });

  it('entra em estado de erro quando a camada de dados falha', async () => {
    mockGet.mockRejectedValue(new Error('boom'));

    const { result } = await renderHook(() => usePublicTeacherProfile('t1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('não busca nada enquanto não houver id', async () => {
    const { result } = await renderHook(() => usePublicTeacherProfile(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGet).not.toHaveBeenCalled();
  });
});

describe('useTeacherContact', () => {
  const mockContact = api.getTeacherContact as jest.MockedFunction<typeof api.getTeacherContact>;
  afterEach(() => jest.clearAllMocks());

  it('expõe a situação do contato', async () => {
    mockContact.mockResolvedValue({ status: 'pending', requestId: 'r1' });

    const { result } = await renderHook(() => useTeacherContact('t1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ status: 'pending', requestId: 'r1' });
  });

  it('não busca nada enquanto não houver id', async () => {
    await renderHook(() => useTeacherContact(undefined), { wrapper: createWrapper() });
    expect(mockContact).not.toHaveBeenCalled();
  });
});
