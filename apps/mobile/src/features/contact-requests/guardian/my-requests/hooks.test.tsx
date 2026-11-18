import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import type { ReactNode } from 'react';

import { useMyProfile } from '@/features/profile/hooks';

import { cancelContactRequest, getMyContactRequest, listMyContactRequests } from './api';
import {
  useCancelContactRequest,
  useMyContactRequest,
  useMyContactRequests,
  useOpenTeacherWhatsApp,
} from './hooks';
import type { MyContactRequest } from './types';

jest.mock('@/features/auth/session-provider', () => ({
  useSession: () => ({ session: { user: { id: 'guardian-1' } } }),
}));
jest.mock('@/features/profile/hooks', () => ({ useMyProfile: jest.fn() }));
jest.mock('expo-linking', () => ({ openURL: jest.fn() }));
jest.mock('./api', () => ({
  listMyContactRequests: jest.fn(),
  getMyContactRequest: jest.fn(),
  cancelContactRequest: jest.fn(),
}));

const mockList = listMyContactRequests as jest.MockedFunction<typeof listMyContactRequests>;
const mockGet = getMyContactRequest as jest.MockedFunction<typeof getMyContactRequest>;
const mockCancel = cancelContactRequest as jest.MockedFunction<typeof cancelContactRequest>;
const mockProfile = useMyProfile as jest.Mock;
const mockOpenUrl = Linking.openURL as jest.Mock;

const HOUR = 60 * 60 * 1000;

function makeRequest(overrides: Partial<MyContactRequest> = {}): MyContactRequest {
  return {
    id: 'request-1',
    status: 'pending',
    guardianId: 'guardian-1',
    teacherId: 'teacher-1',
    teacherName: 'Mariana Alves',
    teacherAvatarUrl: null,
    teacherPhone: null,
    studentName: 'Lucas Martins',
    studentAge: 12,
    schoolGrade: 'elementary_7',
    reason: 'Reforço em frações.',
    preferredTutoringType: 'online',
    createdAt: new Date(Date.now() - HOUR),
    respondedAt: null,
    expiresAt: new Date(Date.now() + 23 * HOUR),
    ...overrides,
  };
}

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function createWrapper(client = createClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  mockList.mockResolvedValue([]);
  mockProfile.mockReturnValue({ data: { full_name: 'Juliana Martins' } });
});

afterEach(() => jest.clearAllMocks());

describe('useMyContactRequests', () => {
  it('carrega as solicitações do responsável logado', async () => {
    const requests = [makeRequest()];
    mockList.mockResolvedValue(requests);

    const { result } = await renderHook(() => useMyContactRequests(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(requests));
    expect(mockList).toHaveBeenCalledWith('guardian-1');
  });
});

describe('useMyContactRequest', () => {
  it('pendente no prazo: pode cancelar e não pode pedir de novo', async () => {
    const request = makeRequest();
    mockGet.mockResolvedValue(request);
    mockList.mockResolvedValue([request]);

    const { result } = await renderHook(() => useMyContactRequest('request-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(request));
    expect(mockGet).toHaveBeenCalledWith('guardian-1', 'request-1');
    expect(result.current.displayStatus).toBe('pending');
    expect(result.current.canCancel).toBe(true);
    expect(result.current.canAskAgain).toBe(false);
  });

  it('pendente com o prazo vencido aparece como expirada e não cancela', async () => {
    const request = makeRequest({ expiresAt: new Date(Date.now() - HOUR) });
    mockGet.mockResolvedValue(request);

    const { result } = await renderHook(() => useMyContactRequest('request-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(request));
    expect(result.current.displayStatus).toBe('expired');
    expect(result.current.canCancel).toBe(false);
  });

  it('recusada sem outra solicitação aberta: pode pedir de novo', async () => {
    const request = makeRequest({ status: 'declined' });
    mockGet.mockResolvedValue(request);
    mockList.mockResolvedValue([request]);

    const { result } = await renderHook(() => useMyContactRequest('request-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.canAskAgain).toBe(true));
    expect(result.current.displayStatus).toBe('declined');
  });

  it('traduz o erro de solicitação não encontrada', async () => {
    mockGet.mockRejectedValue(new Error('contact_request_not_found'));

    const { result } = await renderHook(() => useMyContactRequest('request-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.errorMessage).toBe('Solicitação não encontrada.'));
  });
});

describe('useCancelContactRequest', () => {
  it('cancela a solicitação e recarrega as consultas do responsável', async () => {
    mockCancel.mockResolvedValue(undefined);
    const client = createClient();
    const invalidate = jest.spyOn(client, 'invalidateQueries');

    const { result } = await renderHook(() => useCancelContactRequest('request-1'), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(invalidate).toHaveBeenCalled());
    expect(mockCancel).toHaveBeenCalledWith('guardian-1', 'request-1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['contact-requests', 'guardian'] });
  });

  it('mostra a mensagem em pt-BR quando já foi respondida', async () => {
    mockCancel.mockRejectedValue(new Error('contact_request_already_answered'));

    const { result } = await renderHook(() => useCancelContactRequest('request-1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() =>
      expect(result.current.errorMessage).toBe('Esta solicitação já foi respondida.'),
    );
  });
});

describe('useOpenTeacherWhatsApp', () => {
  const accepted = {
    teacherName: 'Mariana Alves',
    teacherPhone: '+5511999991234',
    studentName: 'Lucas Martins',
  };

  it('abre o WhatsApp do professor com a mensagem pronta', async () => {
    mockOpenUrl.mockResolvedValue(true);
    const { result } = await renderHook(() => useOpenTeacherWhatsApp());

    await act(async () => {
      await result.current.open(accepted);
    });

    expect(mockOpenUrl).toHaveBeenCalledTimes(1);
    const url = mockOpenUrl.mock.calls[0][0] as string;
    expect(url).toContain('https://wa.me/5511999991234?text=');
    expect(decodeURIComponent(url)).toContain('Aqui é Juliana Martins');
    expect(result.current.errorMessage).toBeNull();
  });

  it('sem número liberado, avisa e não abre nada', async () => {
    const { result } = await renderHook(() => useOpenTeacherWhatsApp());

    await act(async () => {
      await result.current.open({ ...accepted, teacherPhone: null });
    });

    expect(mockOpenUrl).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe('Não foi possível montar o link do WhatsApp.');
  });

  it('avisa quando o aparelho não consegue abrir o WhatsApp', async () => {
    mockOpenUrl.mockRejectedValue(new Error('no app'));
    const { result } = await renderHook(() => useOpenTeacherWhatsApp());

    await act(async () => {
      await result.current.open(accepted);
    });

    expect(result.current.errorMessage).toBe('Não foi possível abrir o WhatsApp.');
  });
});