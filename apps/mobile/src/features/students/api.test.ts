import { supabase } from '@/lib/supabase';

import { listMyStudentSubjects } from './api';

// Camada de dados: testamos mockando a única porta do Supabase (@/lib/supabase).
jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const mockFrom = supabase.from as jest.Mock;

afterEach(() => jest.clearAllMocks());

describe('listMyStudentSubjects', () => {
  it('junta as matérias dos alunos sem repetir, na ordem do catálogo', async () => {
    const select = jest.fn().mockResolvedValue({
      data: [
        { subjects: { id: 'english', name: 'Inglês', sort_order: 2 } },
        { subjects: { id: 'math', name: 'Matemática', sort_order: 1 } },
        { subjects: { id: 'math', name: 'Matemática', sort_order: 1 } },
        { subjects: { id: 'arts', name: 'Artes', sort_order: 2 } },
        { subjects: null },
      ],
      error: null,
    });
    mockFrom.mockReturnValue({ select });

    await expect(listMyStudentSubjects()).resolves.toEqual([
      { id: 'math', name: 'Matemática' },
      { id: 'arts', name: 'Artes' },
      { id: 'english', name: 'Inglês' },
    ]);
    expect(mockFrom).toHaveBeenCalledWith('student_subjects');
    expect(select).toHaveBeenCalledWith('subjects ( id, name, sort_order )');
  });

  it('propaga o erro do Supabase', async () => {
    const error = new Error('falha');
    mockFrom.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: null, error }) });

    await expect(listMyStudentSubjects()).rejects.toBe(error);
  });
});
