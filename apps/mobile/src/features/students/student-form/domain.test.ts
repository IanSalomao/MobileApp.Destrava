import {
  diffSubjects,
  NEW_STUDENT_ID,
  normalizeLearningGoal,
  parseStudentRoute,
  toFormValues,
} from './domain';
import type { StudentDetail } from './types';

const STUDENT_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

const STUDENT: StudentDetail = {
  id: STUDENT_ID,
  fullName: 'Lucas Martins',
  schoolGrade: 'elementary_7',
  learningGoal: 'Reforço em frações.',
  subjectIds: ['math', 'portuguese'],
};

describe('parseStudentRoute', () => {
  it('"new" cadastra um aluno novo', () => {
    expect(parseStudentRoute(NEW_STUDENT_ID)).toEqual({ mode: 'new' });
  });

  it('um uuid edita o aluno', () => {
    expect(parseStudentRoute(STUDENT_ID)).toEqual({ mode: 'edit', studentId: STUDENT_ID });
    expect(parseStudentRoute(STUDENT_ID.toUpperCase())).toEqual({
      mode: 'edit',
      studentId: STUDENT_ID.toUpperCase(),
    });
  });

  it('o parâmetro repetido na URL usa o primeiro valor', () => {
    expect(parseStudentRoute([STUDENT_ID, 'new'])).toEqual({ mode: 'edit', studentId: STUDENT_ID });
  });

  it.each([undefined, '', 'exemplo', '123'])('%p é inválido', (param) => {
    expect(parseStudentRoute(param)).toEqual({ mode: 'invalid' });
  });

  it('lista vazia de parâmetros é inválida', () => {
    expect(parseStudentRoute([])).toEqual({ mode: 'invalid' });
  });
});

describe('toFormValues', () => {
  it('converte o aluno nos valores do formulário', () => {
    expect(toFormValues(STUDENT)).toEqual({
      fullName: 'Lucas Martins',
      schoolGrade: 'elementary_7',
      subjectIds: ['math', 'portuguese'],
      learningGoal: 'Reforço em frações.',
    });
  });

  it('objetivo vazio vira texto em branco e a lista de matérias é uma cópia', () => {
    const values = toFormValues({ ...STUDENT, learningGoal: null });

    expect(values.learningGoal).toBe('');
    expect(values.subjectIds).not.toBe(STUDENT.subjectIds);
  });
});

describe('normalizeLearningGoal', () => {
  it('apara o texto', () => {
    expect(normalizeLearningGoal('  Frações  ')).toBe('Frações');
  });

  it.each([undefined, '', '   '])('%p vira null', (value) => {
    expect(normalizeLearningGoal(value)).toBeNull();
  });
});

describe('diffSubjects', () => {
  it('separa o que entra e o que sai', () => {
    expect(diffSubjects(['math', 'history'], ['math', 'english'])).toEqual({
      toAdd: ['english'],
      toRemove: ['history'],
    });
  });

  it('sem mudança não há o que gravar', () => {
    expect(diffSubjects(['math'], ['math'])).toEqual({ toAdd: [], toRemove: [] });
  });

  it('sem matérias antes, todas entram', () => {
    expect(diffSubjects([], ['math', 'english'])).toEqual({
      toAdd: ['math', 'english'],
      toRemove: [],
    });
  });
});
