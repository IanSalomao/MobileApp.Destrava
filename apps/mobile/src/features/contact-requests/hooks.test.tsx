import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useSession } from '@/features/auth/session-provider';

import { getTeacherDashboard, listReceivedContactRequests } from './api';
import { useReceivedContactRequests, useTeacherDashboard } from './hooks';

jest.mock('./api', () => ({
  getTeacherDashboard: jest.fn(),
  listReceivedContactRequests: jest.fn(),
}));

jest.mock('@/features/auth/session-provider', () => ({
  useSession: jest.fn(),
}));

const mockGetTeacherDashboard = getTeacherDashboard as jest.MockedFunction<
  typeof getTeacherDashboard
>;
const mockListReceivedContactRequests = listReceivedContactRequests as jest.MockedFunction<
  typeof listReceivedContactRequests
>;
const mockUseSession = useSession as jest.Mock;

const DASHBOARD = {
  isPublished: true,
  ratingAverage: 4.9,
  ratingCount: 18,
  clientsCount: 4,
  conversationsCount: 2,
  recentContacts: [],
  recentRequests: [],
};

const RECEIVED = [
  {
    id: 'request-1',
    status: 'pending' as const,
    guardianName: 'Renata Souza',
    guardianAvatarUrl: null,
    studentName: 'Lívia Souza',
    schoolGrade: 'high_school_1' as const,
    reason: 'A Lívia precisa de ajuda em cinemática.',
    preferredTutoringType: 'online' as const,
    createdAt: new Date('2026-11-09T10:00:00.000Z'),
    respondedAt: null,
    expiresAt: new Date('2099-01-01T00:00:00.000Z'),
  },
];

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function signInAs(id: string | null) {
  mockUseSession.mockReturnValue({
    session: id ? { user: { id } } : null,
    isLoading: false,
  });
}

describe('useTeacherDashboard', () => {
  afterEach(() => jest.clearAllMocks());

  it('busca o painel do professor logado', async () => {
    signInAs('teacher-1');
    mockGetTeacherDashboard.mockResolvedValue(DASHBOARD);

    const { result } = await renderHook(() => useTeacherDashboard(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetTeacherDashboard).toHaveBeenCalledWith('teacher-1');
    expect(result.current.data).toEqual(DASHBOARD);
  });

  it('não busca nada sem sessão', async () => {
    signInAs(null);

    const { result } = await renderHook(() => useTeacherDashboard(), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetTeacherDashboard).not.toHaveBeenCalled();
  });

  it('entra em estado de erro quando a camada de dados falha', async () => {
    signInAs('teacher-1');
    mockGetTeacherDashboard.mockRejectedValue(new Error('boom'));

    const { result } = await renderHook(() => useTeacherDashboard(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useReceivedContactRequests', () => {
  afterEach(() => jest.clearAllMocks());

  it('busca os pedidos recebidos do professor logado', async () => {
    signInAs('teacher-1');
    mockListReceivedContactRequests.mockResolvedValue(RECEIVED);

    const { result } = await renderHook(() => useReceivedContactRequests(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockListReceivedContactRequests).toHaveBeenCalledWith('teacher-1');
    expect(result.current.data).toEqual(RECEIVED);
  });

  it('não busca nada sem sessão', async () => {
    signInAs(null);

    const { result } = await renderHook(() => useReceivedContactRequests(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockListReceivedContactRequests).not.toHaveBeenCalled();
  });

  it('entra em estado de erro quando a camada de dados falha', async () => {
    signInAs('teacher-1');
    mockListReceivedContactRequests.mockRejectedValue(new Error('boom'));

    const { result } = await renderHook(() => useReceivedContactRequests(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
