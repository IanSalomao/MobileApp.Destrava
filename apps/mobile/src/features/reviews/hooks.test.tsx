import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { useController } from 'react-hook-form';

import { useSession } from '@/features/auth/session-provider';
import { publicTeacherKeys } from '@/features/teachers/public-profile/hooks';

import { createReview, getMyReview, listTeacherReviews, updateReview } from './api';
import { REVIEW_NOT_ALLOWED_MESSAGE } from './errors';
import { reviewKeys, useMyReview, useReviewForm, useTeacherReviews } from './hooks';
import type { Review } from './types';

// Camada de ViewModel: testamos os hooks mockando a camada de dados (api.ts) e a sessão.
jest.mock('./api', () => ({
  getMyReview: jest.fn(),
  createReview: jest.fn(),
  updateReview: jest.fn(),
  listTeacherReviews: jest.fn(),
}));

jest.mock('@/features/auth/session-provider', () => ({
  useSession: jest.fn(),
}));

// Só as chaves do perfil público interessam aqui; a api dele não pode carregar o Supabase.
jest.mock('@/features/teachers/public-profile/api', () => ({
  getPublicTeacherProfile: jest.fn(),
}));

const mockGetMine = getMyReview as jest.MockedFunction<typeof getMyReview>;
const mockCreate = createReview as jest.MockedFunction<typeof createReview>;
const mockUpdate = updateReview as jest.MockedFunction<typeof updateReview>;
const mockList = listTeacherReviews as jest.MockedFunction<typeof listTeacherReviews>;
const mockUseSession = useSession as jest.Mock;

const GUARDIAN_ID = 'guardian-1';
const TEACHER_ID = '6f1c2b1e-8a3d-4c55-9b7e-2d4f6a8b0c11';

const REVIEW: Review = {
  id: 'r1',
  teacherId: TEACHER_ID,
  rating: 4,
  comment: 'Explica com paciência.',
  reviewerName: 'Camila S.',
  createdAt: '2026-11-10T12:00:00Z',
  updatedAt: '2026-11-10T12:00:00Z',
};

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function createWrapper(client = createClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

// Preenche o comentário como a tela faz: pelo campo ligado ao control do hook.
function useFilledReviewForm(review: Review | null, onSaved?: () => void) {
  const form = useReviewForm(TEACHER_ID, review, onSaved);
  const {
    field: { onChange: setComment },
  } = useController({ control: form.control, name: 'comment' });
  return { form, setComment };
}

beforeEach(() => {
  mockUseSession.mockReturnValue({ session: { user: { id: GUARDIAN_ID } } });
});
afterEach(() => jest.clearAllMocks());

describe('useMyReview', () => {
  it('carrega a avaliação do responsável para o professor', async () => {
    mockGetMine.mockResolvedValue(REVIEW);

    const { result } = await renderHook(() => useMyReview(TEACHER_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(REVIEW));
    expect(mockGetMine).toHaveBeenCalledWith(GUARDIAN_ID, TEACHER_ID);
    expect(result.current.errorMessage).toBeNull();
  });

  it('não vai ao banco com id de exemplo nem sem sessão', async () => {
    const { result } = await renderHook(() => useMyReview('exemplo'), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');

    mockUseSession.mockReturnValue({ session: null });
    const { result: noSession } = await renderHook(() => useMyReview(TEACHER_ID), {
      wrapper: createWrapper(),
    });
    expect(noSession.current.fetchStatus).toBe('idle');

    const { result: noId } = await renderHook(() => useMyReview(undefined), {
      wrapper: createWrapper(),
    });
    expect(noId.current.fetchStatus).toBe('idle');
    expect(mockGetMine).not.toHaveBeenCalled();
  });

  it('traduz a falha ao carregar', async () => {
    mockGetMine.mockRejectedValue(new Error('Network request failed'));

    const { result } = await renderHook(() => useMyReview(TEACHER_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.errorMessage).toMatch(/Verifique sua conexão/));
  });
});

describe('useTeacherReviews', () => {
  it('junta as páginas e busca a próxima enquanto houver', async () => {
    mockList
      .mockResolvedValueOnce({ reviews: [REVIEW], nextPage: 1 })
      .mockResolvedValueOnce({ reviews: [{ ...REVIEW, id: 'r2' }], nextPage: null });

    const { result } = await renderHook(() => useTeacherReviews(TEACHER_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.reviews).toHaveLength(1));
    expect(mockList).toHaveBeenLastCalledWith(TEACHER_ID, 0);
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.reviews.map((r) => r.id)).toEqual(['r1', 'r2']));
    expect(mockList).toHaveBeenLastCalledWith(TEACHER_ID, 1);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('não busca nada com id inválido', async () => {
    const { result } = await renderHook(() => useTeacherReviews('exemplo'), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.reviews).toEqual([]);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('traduz a falha ao carregar', async () => {
    mockList.mockRejectedValue(new Error('Network request failed'));

    const { result } = await renderHook(() => useTeacherReviews(TEACHER_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.errorMessage).toMatch(/Verifique sua conexão/));
  });
});

describe('useReviewForm', () => {
  it('começa sem nota e com o envio bloqueado', async () => {
    const { result } = await renderHook(() => useReviewForm(TEACHER_ID, null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.rating).toBe(0);
    expect(result.current.ratingLabel).toBeNull();
    expect(result.current.hadClass).toBe(true);
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.commentLength).toBe(0);
  });

  it('cria a avaliação, recarrega avaliações e perfil público e volta', async () => {
    mockCreate.mockResolvedValue(REVIEW);
    const onSaved = jest.fn();
    const client = createClient();
    const invalidate = jest.spyOn(client, 'invalidateQueries');

    const { result } = await renderHook(() => useFilledReviewForm(null, onSaved), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      result.current.form.setRating(5);
      result.current.setComment('  Meu filho melhorou muito.  ');
    });
    expect(result.current.form.canSubmit).toBe(true);
    expect(result.current.form.ratingLabel).toBe('Excelente');
    expect(result.current.form.commentLength).toBe('  Meu filho melhorou muito.  '.length);

    await act(async () => {
      await result.current.form.submit();
    });

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(mockCreate).toHaveBeenCalledWith(TEACHER_ID, {
      rating: 5,
      comment: 'Meu filho melhorou muito.',
    });
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: reviewKeys.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: publicTeacherKeys.detail(TEACHER_ID) });
  });

  it('com avaliação existente, começa com ela e salva a edição', async () => {
    mockUpdate.mockResolvedValue({ ...REVIEW, rating: 2, comment: null });
    const onSaved = jest.fn();

    const { result } = await renderHook(() => useFilledReviewForm(REVIEW, onSaved), {
      wrapper: createWrapper(),
    });

    expect(result.current.form.isEditing).toBe(true);
    expect(result.current.form.rating).toBe(4);
    expect(result.current.form.canSubmit).toBe(true);

    await act(async () => {
      result.current.form.setRating(2);
      result.current.setComment('   ');
    });
    await act(async () => {
      await result.current.form.submit();
    });

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(mockUpdate).toHaveBeenCalledWith('r1', { rating: 2, comment: null });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('avaliação sem comentário salvo começa com o campo vazio', async () => {
    const { result } = await renderHook(
      () => useReviewForm(TEACHER_ID, { ...REVIEW, comment: null }),
      { wrapper: createWrapper() },
    );

    expect(result.current.commentLength).toBe(0);
  });

  it('"Ainda não" teve aula bloqueia o envio', async () => {
    const { result } = await renderHook(() => useReviewForm(TEACHER_ID, REVIEW), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.setHadClass(false);
    });
    expect(result.current.canSubmit).toBe(false);

    await act(async () => {
      await result.current.submit();
    });

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('sem nota, a validação segura o envio e explica', async () => {
    const { result } = await renderHook(() => useReviewForm(TEACHER_ID, null), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submit();
    });

    await waitFor(() =>
      expect(result.current.ratingError).toBe('Escolha uma nota de 1 a 5 estrelas.'),
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('traduz a recusa do RLS (sem solicitação aceita) e não volta', async () => {
    mockCreate.mockRejectedValue({
      code: '42501',
      message: 'new row violates row-level security policy for table "reviews"',
    });
    const onSaved = jest.fn();

    const { result } = await renderHook(() => useReviewForm(TEACHER_ID, null, onSaved), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.setRating(3);
    });
    await act(async () => {
      await result.current.submit();
    });

    await waitFor(() => expect(result.current.errorMessage).toBe(REVIEW_NOT_ALLOWED_MESSAGE));
    expect(onSaved).not.toHaveBeenCalled();
  });
});
