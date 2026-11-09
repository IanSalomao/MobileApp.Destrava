import { supabase } from '@/lib/supabase';

import { listCities, listLanguages, listSubjects } from './api';

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

describe('listLanguages', () => {
  afterEach(() => jest.clearAllMocks());

  it('busca os idiomas ordenados pelo servidor e devolve os dados', async () => {
    const data = [{ id: 'english', name: 'Inglês' }];
    const order = jest.fn().mockResolvedValue({ data, error: null });
    const select = jest.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select });

    await expect(listLanguages()).resolves.toEqual(data);
    expect(mockFrom).toHaveBeenCalledWith('languages');
    expect(select).toHaveBeenCalledWith('id, name');
    expect(order).toHaveBeenCalledWith('sort_order');
  });

  it('propaga o erro do Supabase em vez de engolir', async () => {
    const error = new Error('falha de rede');
    const order = jest.fn().mockResolvedValue({ data: null, error });
    mockFrom.mockReturnValue({ select: () => ({ order }) });

    await expect(listLanguages()).rejects.toBe(error);
  });
});

describe('listCities', () => {
  afterEach(() => jest.clearAllMocks());

  it('busca os municípios do estado em ordem alfabética', async () => {
    const data = [{ id: 3550308, name: 'São Paulo' }];
    const order = jest.fn().mockResolvedValue({ data, error: null });
    const eq = jest.fn().mockReturnValue({ order });
    const select = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    await expect(listCities('SP')).resolves.toEqual(data);
    expect(mockFrom).toHaveBeenCalledWith('cities');
    expect(select).toHaveBeenCalledWith('id, name');
    expect(eq).toHaveBeenCalledWith('state', 'SP');
    expect(order).toHaveBeenCalledWith('name');
  });

  it('propaga o erro do Supabase em vez de engolir', async () => {
    const error = new Error('falha de rede');
    const order = jest.fn().mockResolvedValue({ data: null, error });
    mockFrom.mockReturnValue({ select: () => ({ eq: () => ({ order }) }) });

    await expect(listCities('SP')).rejects.toBe(error);
  });
});
