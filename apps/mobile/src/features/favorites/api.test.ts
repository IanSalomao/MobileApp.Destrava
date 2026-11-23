import { supabase } from '@/lib/supabase';

import { addFavorite, listFavoriteTeacherIds, listFavoriteTeachers, removeFavorite } from './api';

// Camada de dados: testamos mockando a única porta do Supabase (@/lib/supabase).
jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const mockFrom = supabase.from as jest.Mock;

describe('listFavoriteTeacherIds', () => {
  afterEach(() => jest.clearAllMocks());

  it('devolve só os ids dos professores favoritados', async () => {
    const select = jest.fn().mockResolvedValue({
      data: [{ teacher_id: 'a' }, { teacher_id: 'b' }],
      error: null,
    });
    mockFrom.mockReturnValue({ select });

    await expect(listFavoriteTeacherIds()).resolves.toEqual(['a', 'b']);
    expect(mockFrom).toHaveBeenCalledWith('favorite_teachers');
    expect(select).toHaveBeenCalledWith('teacher_id');
  });

  it('propaga o erro do Supabase', async () => {
    const error = new Error('falha');
    mockFrom.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: null, error }) });

    await expect(listFavoriteTeacherIds()).rejects.toBe(error);
  });
});

describe('listFavoriteTeachers', () => {
  afterEach(() => jest.clearAllMocks());

  it('busca do mais recente para o mais antigo e converte para o modelo da tela', async () => {
    const data = [
      {
        created_at: '2026-11-10T12:00:00Z',
        teachers: {
          id: 't1',
          hourly_rate_cents: 5000,
          rating_average: null,
          rating_count: 0,
          profiles: { full_name: 'Ana Souza', avatar_url: null },
          teacher_subjects: [],
        },
      },
    ];
    const order = jest.fn().mockResolvedValue({ data, error: null });
    const select = jest.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select });

    const result = await listFavoriteTeachers();

    // Sem a FK explícita o embed é ambíguo (favorite_teachers também liga teachers e profiles).
    expect(select).toHaveBeenCalledWith(expect.stringContaining('profiles!teachers_id_fkey'));
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result[0]).toMatchObject({ id: 't1', fullName: 'Ana Souza', hourlyRateCents: 5000 });
  });

  it('propaga o erro do Supabase', async () => {
    const error = new Error('falha');
    const order = jest.fn().mockResolvedValue({ data: null, error });
    mockFrom.mockReturnValue({ select: jest.fn().mockReturnValue({ order }) });

    await expect(listFavoriteTeachers()).rejects.toBe(error);
  });
});

describe('addFavorite', () => {
  afterEach(() => jest.clearAllMocks());

  it('insere só o teacher_id (o guardian_id vem do banco)', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert });

    await addFavorite('t1');

    expect(insert).toHaveBeenCalledWith({ teacher_id: 't1' });
  });

  it('propaga o erro do Supabase', async () => {
    const error = new Error('falha');
    mockFrom.mockReturnValue({ insert: jest.fn().mockResolvedValue({ error }) });

    await expect(addFavorite('t1')).rejects.toBe(error);
  });
});

describe('removeFavorite', () => {
  afterEach(() => jest.clearAllMocks());

  it('remove pelo teacher_id', async () => {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const del = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ delete: del });

    await removeFavorite('t1');

    expect(eq).toHaveBeenCalledWith('teacher_id', 't1');
  });

  it('propaga o erro do Supabase', async () => {
    const error = new Error('falha');
    const eq = jest.fn().mockResolvedValue({ error });
    mockFrom.mockReturnValue({ delete: jest.fn().mockReturnValue({ eq }) });

    await expect(removeFavorite('t1')).rejects.toBe(error);
  });
});
