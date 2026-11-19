import { supabase } from '@/lib/supabase';

import { createReview, getMyReview, listTeacherReviews, updateReview } from './api';

// Camada de dados: testamos mockando a única porta do Supabase (@/lib/supabase).
jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const mockFrom = supabase.from as jest.Mock;

const ROW = {
  id: 'r1',
  teacher_id: 't1',
  rating: 5,
  comment: 'Ótima professora.',
  reviewer_name: 'Camila S.',
  created_at: '2026-11-10T12:00:00Z',
  updated_at: '2026-11-10T12:00:00Z',
};

const REVIEW = {
  id: 'r1',
  teacherId: 't1',
  rating: 5,
  comment: 'Ótima professora.',
  reviewerName: 'Camila S.',
  createdAt: '2026-11-10T12:00:00Z',
  updatedAt: '2026-11-10T12:00:00Z',
};

type Result = { data: unknown; error: unknown };

// Cadeia do PostgREST: cada método devolve a própria cadeia; o fim (maybeSingle, single ou range)
// resolve com o resultado.
function mockChain(result: Result) {
  const chain = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    range: jest.fn().mockResolvedValue(result),
    single: jest.fn().mockResolvedValue(result),
    maybeSingle: jest.fn().mockResolvedValue(result),
  };
  chain.select.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  mockFrom.mockReturnValue(chain);
  return chain;
}

afterEach(() => jest.clearAllMocks());

describe('getMyReview', () => {
  it('busca a avaliação do par responsável/professor', async () => {
    const chain = mockChain({ data: ROW, error: null });

    await expect(getMyReview('g1', 't1')).resolves.toEqual(REVIEW);
    expect(mockFrom).toHaveBeenCalledWith('reviews');
    expect(chain.eq).toHaveBeenCalledWith('guardian_id', 'g1');
    expect(chain.eq).toHaveBeenCalledWith('teacher_id', 't1');
  });

  it('sem avaliação, devolve null', async () => {
    mockChain({ data: null, error: null });

    await expect(getMyReview('g1', 't1')).resolves.toBeNull();
  });

  it('propaga o erro do Supabase', async () => {
    const error = new Error('falha');
    mockChain({ data: null, error });

    await expect(getMyReview('g1', 't1')).rejects.toBe(error);
  });
});

describe('createReview', () => {
  it('envia só teacher_id, nota e comentário (guardian_id vem do banco)', async () => {
    const chain = mockChain({ data: ROW, error: null });

    await expect(createReview('t1', { rating: 5, comment: 'Ótima professora.' })).resolves.toEqual(
      REVIEW,
    );
    expect(chain.insert).toHaveBeenCalledWith({
      teacher_id: 't1',
      rating: 5,
      comment: 'Ótima professora.',
    });
    expect(chain.single).toHaveBeenCalled();
  });

  it('propaga a recusa do RLS', async () => {
    const error = { code: '42501', message: 'new row violates row-level security policy' };
    mockChain({ data: null, error });

    await expect(createReview('t1', { rating: 4, comment: null })).rejects.toBe(error);
  });
});

describe('updateReview', () => {
  it('atualiza só nota e comentário da avaliação', async () => {
    const chain = mockChain({ data: { ...ROW, rating: 3, comment: null }, error: null });

    await expect(updateReview('r1', { rating: 3, comment: null })).resolves.toMatchObject({
      id: 'r1',
      rating: 3,
      comment: null,
    });
    expect(chain.update).toHaveBeenCalledWith({ rating: 3, comment: null });
    expect(chain.eq).toHaveBeenCalledWith('id', 'r1');
  });

  it('sem linha atualizada, falha com review_not_found', async () => {
    mockChain({ data: null, error: null });

    await expect(updateReview('r1', { rating: 3, comment: null })).rejects.toThrow(
      'review_not_found',
    );
  });

  it('propaga o erro do Supabase', async () => {
    const error = new Error('falha');
    mockChain({ data: null, error });

    await expect(updateReview('r1', { rating: 3, comment: null })).rejects.toBe(error);
  });
});

describe('listTeacherReviews', () => {
  it('lista da mais recente para a mais antiga e indica a página seguinte', async () => {
    const rows = [ROW, { ...ROW, id: 'r2' }, { ...ROW, id: 'r3' }];
    const chain = mockChain({ data: rows, error: null });

    const page = await listTeacherReviews('t1', 0, 2);

    expect(chain.eq).toHaveBeenCalledWith('teacher_id', 't1');
    expect(chain.order).toHaveBeenNthCalledWith(1, 'created_at', { ascending: false });
    expect(chain.order).toHaveBeenNthCalledWith(2, 'id', { ascending: false });
    expect(chain.range).toHaveBeenCalledWith(0, 2);
    expect(page.reviews.map((review) => review.id)).toEqual(['r1', 'r2']);
    expect(page.nextPage).toBe(1);
  });

  it('na última página, não há próxima', async () => {
    const chain = mockChain({ data: [ROW], error: null });

    const page = await listTeacherReviews('t1', 1, 2);

    expect(chain.range).toHaveBeenCalledWith(2, 4);
    expect(page.reviews).toHaveLength(1);
    expect(page.nextPage).toBeNull();
  });

  it('usa a primeira página e o tamanho padrão quando não informados', async () => {
    const chain = mockChain({ data: [], error: null });

    await expect(listTeacherReviews('t1')).resolves.toEqual({ reviews: [], nextPage: null });
    expect(chain.range).toHaveBeenCalledWith(0, 10);
  });

  it('propaga o erro do Supabase', async () => {
    const error = new Error('falha');
    mockChain({ data: null, error });

    await expect(listTeacherReviews('t1', 0)).rejects.toBe(error);
  });
});
