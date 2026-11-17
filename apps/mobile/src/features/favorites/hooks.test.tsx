import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useSession } from '@/features/auth/session-provider';

import { addFavorite, listFavoriteTeacherIds, listFavoriteTeachers, removeFavorite } from './api';
import {
  favoriteKeys,
  useFavoriteIds,
  useFavoriteTeachers,
  useIsFavorite,
  useToggleFavorite,
} from './hooks';

jest.mock('./api', () => ({
  listFavoriteTeacherIds: jest.fn(),
  listFavoriteTeachers: jest.fn(),
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
}));

jest.mock('@/features/auth/session-provider', () => ({
  useSession: jest.fn(),
}));

const mockListIds = listFavoriteTeacherIds as jest.MockedFunction<typeof listFavoriteTeacherIds>;
const mockList = listFavoriteTeachers as jest.MockedFunction<typeof listFavoriteTeachers>;
const mockAdd = addFavorite as jest.MockedFunction<typeof addFavorite>;
const mockRemove = removeFavorite as jest.MockedFunction<typeof removeFavorite>;
const mockUseSession = useSession as jest.Mock;

const USER_ID = 'guardian-1';

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('favoritos (ViewModel)', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({ session: { user: { id: USER_ID } } });
  });
  afterEach(() => jest.clearAllMocks());

  it('useFavoriteIds expõe os ids dos favoritos', async () => {
    mockListIds.mockResolvedValue(['a', 'b']);

    const { result } = await renderHook(() => useFavoriteIds(), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(['a', 'b']);
  });

  it('não busca nada sem usuário logado', async () => {
    mockUseSession.mockReturnValue({ session: null });

    const { result } = await renderHook(() => useFavoriteIds(), {
      wrapper: createWrapper(createClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockListIds).not.toHaveBeenCalled();
  });

  it('useIsFavorite diz se o professor está na lista', async () => {
    mockListIds.mockResolvedValue(['a']);
    const wrapper = createWrapper(createClient());

    const { result } = await renderHook(() => ({ a: useIsFavorite('a'), b: useIsFavorite('b') }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.a).toBe(true));
    expect(result.current.b).toBe(false);
  });

  it('useFavoriteTeachers expõe a lista da tela', async () => {
    const data = [
      {
        id: 't1',
        fullName: 'Ana',
        avatarUrl: null,
        subjects: [],
        hourlyRateCents: 5000,
        ratingAverage: null,
        ratingCount: 0,
      },
    ];
    mockList.mockResolvedValue(data);

    const { result } = await renderHook(() => useFavoriteTeachers(), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
  });

  it('favoritar adiciona o id na hora e chama a api', async () => {
    mockAdd.mockResolvedValue(undefined);
    const client = createClient();
    client.setQueryData(favoriteKeys.ids(USER_ID), ['a']);

    const { result } = await renderHook(() => useToggleFavorite(), {
      wrapper: createWrapper(client),
    });
    await act(async () => {
      await result.current.mutateAsync({ teacherId: 'b', isFavorite: false });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockAdd).toHaveBeenCalledWith('b');
    expect(client.getQueryData(favoriteKeys.ids(USER_ID))).toEqual(['a', 'b']);
  });

  it('desfavoritar remove o id e chama a api', async () => {
    mockRemove.mockResolvedValue(undefined);
    const client = createClient();
    client.setQueryData(favoriteKeys.ids(USER_ID), ['a', 'b']);

    const { result } = await renderHook(() => useToggleFavorite(), {
      wrapper: createWrapper(client),
    });
    await act(async () => {
      await result.current.mutateAsync({ teacherId: 'a', isFavorite: true });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockRemove).toHaveBeenCalledWith('a');
    expect(client.getQueryData(favoriteKeys.ids(USER_ID))).toEqual(['b']);
  });

  it('desfaz a atualização otimista e mostra mensagem quando a api falha', async () => {
    mockAdd.mockRejectedValue(new Error('falha de rede'));
    const client = createClient();
    client.setQueryData(favoriteKeys.ids(USER_ID), ['a']);

    const { result } = await renderHook(() => useToggleFavorite(), {
      wrapper: createWrapper(client),
    });
    await act(async () => {
      await result.current.mutateAsync({ teacherId: 'b', isFavorite: false }).catch(() => {});
    });

    await waitFor(() => expect(result.current.errorMessage).not.toBeNull());
    expect(client.getQueryData(favoriteKeys.ids(USER_ID))).toEqual(['a']);
  });

  it('traduz a recusa da RLS para professor indisponível', async () => {
    mockAdd.mockRejectedValue({
      message: 'new row violates row-level security policy for table "favorite_teachers"',
    });
    const client = createClient();

    const { result } = await renderHook(() => useToggleFavorite(), {
      wrapper: createWrapper(client),
    });
    await act(async () => {
      await result.current.mutateAsync({ teacherId: 'b', isFavorite: false }).catch(() => {});
    });

    await waitFor(() =>
      expect(result.current.errorMessage).toBe('Este professor não está mais disponível.'),
    );
  });

  it('sem usuário logado, não mexe no cache mas ainda chama a api', async () => {
    mockUseSession.mockReturnValue({ session: null });
    mockAdd.mockResolvedValue(undefined);
    const client = createClient();

    const { result } = await renderHook(() => useToggleFavorite(), {
      wrapper: createWrapper(client),
    });
    await act(async () => {
      await result.current.mutateAsync({ teacherId: 'b', isFavorite: false });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockAdd).toHaveBeenCalledWith('b');
    expect(client.getQueryCache().getAll()).toHaveLength(0);
  });
});
