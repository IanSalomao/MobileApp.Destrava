import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useSession } from '@/features/auth/session-provider';

import {
  answerContactRequest,
  getGuardianContactDetails,
  getReceivedContactRequest,
  getTeacherDashboard,
  listReceivedContactRequests,
} from './api';
import {
  useAnswerContactRequest,
  useGuardianContactDetails,
  useReceivedContactRequest,
  useReceivedContactRequests,
  useTeacherDashboard,
} from './hooks';

jest.mock('./api', () => ({
  getTeacherDashboard: jest.fn(),
  listReceivedContactRequests: jest.fn(),
  getReceivedContactRequest: jest.fn(),
  getGuardianContactDetails: jest.fn(),
  answerContactRequest: jest.fn(),
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
const mockGetReceivedContactRequest = getReceivedContactRequest as jest.MockedFunction<
  typeof getReceivedContactRequest
>;
const mockGetGuardianContactDetails = getGuardianContactDetails as jest.MockedFunction<
  typeof getGuardianContactDetails
>;
const mockAnswerContactRequest = answerContactRequest as jest.MockedFunction<
  typeof answerContactRequest
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

const DETAIL = {
  ...RECEIVED[0],
  guardianId: 'g1',
  teacherId: 'teacher-1',
  studentAge: 15,
};

function createWrapper(
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) {
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

describe('useReceivedContactRequest', () => {
  afterEach(() => jest.clearAllMocks());

  it('busca o detalhe e libera aceite/recusa quando o pedido é do professor', async () => {
    signInAs('teacher-1');
    mockGetReceivedContactRequest.mockResolvedValue(DETAIL);

    const { result } = await renderHook(() => useReceivedContactRequest('request-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetReceivedContactRequest).toHaveBeenCalledWith('teacher-1', 'request-1');
    expect(result.current.canAccept).toBe(true);
    expect(result.current.canDecline).toBe(true);
  });

  it('não busca nada sem sessão', async () => {
    signInAs(null);

    const { result } = await renderHook(() => useReceivedContactRequest('request-1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetReceivedContactRequest).not.toHaveBeenCalled();
  });

  it('traduz o erro da camada de dados', async () => {
    signInAs('teacher-1');
    mockGetReceivedContactRequest.mockRejectedValue(new Error('contact_request_not_found'));

    const { result } = await renderHook(() => useReceivedContactRequest('request-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorMessage).toBe('Solicitação não encontrada.');
  });
});

describe('useGuardianContactDetails', () => {
  afterEach(() => jest.clearAllMocks());

  it('não busca o telefone enquanto o pedido não foi aceito', async () => {
    const { result } = await renderHook(() => useGuardianContactDetails('g1', false), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetGuardianContactDetails).not.toHaveBeenCalled();
  });

  it('busca o telefone quando o pedido foi aceito', async () => {
    mockGetGuardianContactDetails.mockResolvedValue('+5511970000001');

    const { result } = await renderHook(() => useGuardianContactDetails('g1', true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetGuardianContactDetails).toHaveBeenCalledWith('g1');
    expect(result.current.data).toBe('+5511970000001');
  });
});

describe('useAnswerContactRequest', () => {
  afterEach(() => jest.clearAllMocks());

  it('responde o pedido e invalida a lista, o painel e o detalhe', async () => {
    signInAs('teacher-1');
    mockAnswerContactRequest.mockResolvedValue(undefined);

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidate = jest.spyOn(client, 'invalidateQueries');

    const { result } = await renderHook(() => useAnswerContactRequest('request-1'), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      result.current.mutate('accepted');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAnswerContactRequest).toHaveBeenCalledWith('teacher-1', 'request-1', 'accepted');
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['contact-requests', 'received', 'teacher-1'],
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['contact-requests', 'teacher-dashboard', 'teacher-1'],
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['contact-requests', 'received-detail', 'teacher-1', 'request-1'],
    });
  });

  it('traduz o erro do banco ao responder', async () => {
    signInAs('teacher-1');
    mockAnswerContactRequest.mockRejectedValue(new Error('contact_request_expired'));

    const { result } = await renderHook(() => useAnswerContactRequest('request-1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('declined');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorMessage).toBe('O prazo para responder esta solicitação expirou.');
  });
});
