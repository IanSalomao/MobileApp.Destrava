import { supabase } from '@/lib/supabase';

import { getStudent, updateStudent } from './api';

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const mockFrom = supabase.from as jest.Mock;

const ROW = {
  id: 'student-1',
  full_name: 'Lucas Martins',
  school_grade: 'elementary_7',
  learning_goal: 'Reforço em frações.',
};

const INPUT = {
  fullName: 'Lucas Martins',
  schoolGrade: 'elementary_8' as const,
  subjectIds: ['math', 'english'],
  learningGoal: '  Preparar as provas  ',
};

type Result = { data: unknown; error: unknown };

// Monta o que `supabase.from(tabela)` devolve em students e student_subjects.
function mockTables(tables: {
  student?: Result;
  subjects?: Result;
  insert?: Result;
  remove?: Result;
}) {
  const maybeSingle = jest.fn().mockResolvedValue(tables.student ?? { data: null, error: null });
  const studentChain = { eq: jest.fn(), select: jest.fn(), maybeSingle };
  studentChain.eq.mockReturnValue(studentChain);
  studentChain.select.mockReturnValue(studentChain);
  const studentSelect = jest.fn().mockReturnValue(studentChain);
  const update = jest.fn().mockReturnValue(studentChain);

  const subjectsEq = jest.fn().mockResolvedValue(tables.subjects ?? { data: [], error: null });
  const subjectsSelect = jest.fn().mockReturnValue({ eq: subjectsEq });
  const insert = jest.fn().mockResolvedValue(tables.insert ?? { data: null, error: null });
  const removeIn = jest.fn().mockResolvedValue(tables.remove ?? { data: null, error: null });
  const removeEq = jest.fn().mockReturnValue({ in: removeIn });
  const remove = jest.fn().mockReturnValue({ eq: removeEq });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'students') return { select: studentSelect, update };
    if (table === 'student_subjects') {
      return { select: subjectsSelect, insert, delete: remove };
    }
    throw new Error(`tabela inesperada: ${table}`);
  });

  return {
    studentChain,
    studentSelect,
    update,
    subjectsSelect,
    subjectsEq,
    insert,
    remove,
    removeEq,
    removeIn,
  };
}

afterEach(() => jest.clearAllMocks());

describe('getStudent', () => {
  it('lê o aluno do responsável e as matérias de interesse', async () => {
    const mocks = mockTables({
      student: { data: ROW, error: null },
      subjects: { data: [{ subject_id: 'math' }, { subject_id: 'english' }], error: null },
    });

    const student = await getStudent('guardian-1', 'student-1');

    expect(mockFrom).toHaveBeenCalledWith('students');
    expect(mocks.studentChain.eq).toHaveBeenCalledWith('id', 'student-1');
    expect(mocks.studentChain.eq).toHaveBeenCalledWith('guardian_id', 'guardian-1');
    expect(mocks.subjectsEq).toHaveBeenCalledWith('student_id', 'student-1');
    expect(student).toEqual({
      id: 'student-1',
      fullName: 'Lucas Martins',
      schoolGrade: 'elementary_7',
      learningGoal: 'Reforço em frações.',
      subjectIds: ['math', 'english'],
    });
  });

  it('sem o aluno (ou de outro responsável), falha com student_not_found', async () => {
    mockTables({ student: { data: null, error: null } });

    await expect(getStudent('guardian-1', 'student-1')).rejects.toThrow('student_not_found');
  });

  it('deixa subir o erro do Supabase ao ler o aluno', async () => {
    const failure = { message: 'boom' };
    mockTables({ student: { data: null, error: failure } });

    await expect(getStudent('guardian-1', 'student-1')).rejects.toBe(failure);
  });

  it('deixa subir o erro do Supabase ao ler as matérias', async () => {
    const failure = { message: 'boom' };
    mockTables({
      student: { data: ROW, error: null },
      subjects: { data: null, error: failure },
    });

    await expect(getStudent('guardian-1', 'student-1')).rejects.toBe(failure);
  });
});

describe('updateStudent', () => {
  it('atualiza só os campos que o banco deixa editar, do aluno do responsável', async () => {
    const mocks = mockTables({
      student: { data: { id: 'student-1' }, error: null },
      subjects: { data: [{ subject_id: 'math' }, { subject_id: 'english' }], error: null },
    });

    await updateStudent('guardian-1', 'student-1', INPUT);

    expect(mocks.update).toHaveBeenCalledWith({
      full_name: 'Lucas Martins',
      school_grade: 'elementary_8',
      learning_goal: 'Preparar as provas',
    });
    expect(mocks.studentChain.eq).toHaveBeenCalledWith('id', 'student-1');
    expect(mocks.studentChain.eq).toHaveBeenCalledWith('guardian_id', 'guardian-1');
  });

  it('objetivo em branco vira null', async () => {
    const mocks = mockTables({
      student: { data: { id: 'student-1' }, error: null },
      subjects: { data: [{ subject_id: 'math' }, { subject_id: 'english' }], error: null },
    });

    await updateStudent('guardian-1', 'student-1', { ...INPUT, learningGoal: '   ' });

    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ learning_goal: null }));
  });

  it('sem mudança nas matérias não insere nem remove nada', async () => {
    const mocks = mockTables({
      student: { data: { id: 'student-1' }, error: null },
      subjects: { data: [{ subject_id: 'english' }, { subject_id: 'math' }], error: null },
    });

    await updateStudent('guardian-1', 'student-1', INPUT);

    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it('vincula as matérias novas e desvincula as que saíram', async () => {
    const mocks = mockTables({
      student: { data: { id: 'student-1' }, error: null },
      subjects: { data: [{ subject_id: 'math' }, { subject_id: 'history' }], error: null },
    });

    await updateStudent('guardian-1', 'student-1', INPUT);

    expect(mocks.insert).toHaveBeenCalledWith([{ student_id: 'student-1', subject_id: 'english' }]);
    expect(mocks.removeEq).toHaveBeenCalledWith('student_id', 'student-1');
    expect(mocks.removeIn).toHaveBeenCalledWith('subject_id', ['history']);
  });

  it('sem o aluno (ou de outro responsável), falha com student_not_found e não mexe nas matérias', async () => {
    const mocks = mockTables({ student: { data: null, error: null } });

    await expect(updateStudent('guardian-1', 'student-1', INPUT)).rejects.toThrow(
      'student_not_found',
    );
    expect(mocks.subjectsSelect).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('deixa subir o erro do Supabase ao atualizar o aluno', async () => {
    const failure = { message: 'boom' };
    mockTables({ student: { data: null, error: failure } });

    await expect(updateStudent('guardian-1', 'student-1', INPUT)).rejects.toBe(failure);
  });

  it('deixa subir o erro do Supabase ao ler as matérias atuais', async () => {
    const failure = { message: 'boom' };
    mockTables({
      student: { data: { id: 'student-1' }, error: null },
      subjects: { data: null, error: failure },
    });

    await expect(updateStudent('guardian-1', 'student-1', INPUT)).rejects.toBe(failure);
  });

  it('deixa subir o erro do Supabase ao vincular matérias', async () => {
    const failure = { message: 'boom' };
    mockTables({
      student: { data: { id: 'student-1' }, error: null },
      subjects: { data: [], error: null },
      insert: { data: null, error: failure },
    });

    await expect(updateStudent('guardian-1', 'student-1', INPUT)).rejects.toBe(failure);
  });

  it('deixa subir o erro do Supabase ao desvincular matérias', async () => {
    const failure = { message: 'boom' };
    mockTables({
      student: { data: { id: 'student-1' }, error: null },
      subjects: {
        data: [{ subject_id: 'math' }, { subject_id: 'english' }, { subject_id: 'art' }],
        error: null,
      },
      remove: { data: null, error: failure },
    });

    await expect(updateStudent('guardian-1', 'student-1', INPUT)).rejects.toBe(failure);
  });
});
