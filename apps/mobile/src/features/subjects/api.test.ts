import { supabase } from '@/lib/supabase';

import { listSubjects } from './api';

// Camada de dados: testamos mockando a única porta do Supabase (@/lib/supabase).
jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const mockFrom = supabase.from as jest.Mock;

describe('listSubjects', () => {
  afterEach(() => jest.clearAllMocks());

  it('busca as matérias ordenadas pelo servidor e devolve os dados', async () => {
    const data = [
      { id: 'math', name: 'Matemática' },
      { id: 'portuguese', name: 'Português' },
    ];
    const order = jest.fn().mockResolvedValue({ data, error: null });
    const select = jest.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select });

    await expect(listSubjects()).resolves.toEqual(data);
    expect(mockFrom).toHaveBeenCalledWith('subjects');
    expect(select).toHaveBeenCalledWith('id, name');
    expect(order).toHaveBeenCalledWith('sort_order');
  });

  it('propaga o erro do Supabase em vez de engolir', async () => {
    const error = new Error('falha de rede');
    const order = jest.fn().mockResolvedValue({ data: null, error });
    mockFrom.mockReturnValue({ select: () => ({ order }) });

    await expect(listSubjects()).rejects.toBe(error);
  });
});
