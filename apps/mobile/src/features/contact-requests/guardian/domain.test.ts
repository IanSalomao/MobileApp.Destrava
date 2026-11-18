import type { StudentSummary } from '@/features/students/types';

import {
  buildDefaultValues,
  buildStudentOptions,
  formatResponseDeadline,
  parseStudentAge,
  studentFieldsFor,
  toContactRequestPayload,
} from './domain';
import { NEW_STUDENT_CHOICE, type ContactRequestFormValues } from './schemas';

const LUCAS: StudentSummary = {
  id: 'student-1',
  fullName: 'Lucas Martins',
  schoolGrade: 'elementary_7',
  preferredTutoringType: 'online',
};

const MARIA: StudentSummary = {
  id: 'student-2',
  fullName: 'Maria Martins',
  schoolGrade: 'high_school_1',
  preferredTutoringType: null,
};

const VALUES: ContactRequestFormValues = {
  guardianName: '  Juliana Martins ',
  studentChoice: 'student-1',
  studentName: 'Lucas Martins',
  schoolGrade: 'elementary_7',
  studentAge: '12',
  tutoringPreference: 'online',
  reason: '  Reforço em frações.  ',
};

describe('parseStudentAge', () => {
  it('converte o texto em número', () => {
    expect(parseStudentAge('12')).toBe(12);
  });

  it('devolve null quando o campo opcional está vazio', () => {
    expect(parseStudentAge('')).toBeNull();
    expect(parseStudentAge('  ')).toBeNull();
  });
});

describe('buildStudentOptions', () => {
  it('lista os alunos e fecha com "Informar outro aluno"', () => {
    expect(buildStudentOptions([LUCAS, MARIA])).toEqual([
      { value: 'student-1', label: 'Lucas Martins' },
      { value: 'student-2', label: 'Maria Martins' },
      { value: NEW_STUDENT_CHOICE, label: 'Informar outro aluno' },
    ]);
  });

  it('sem alunos cadastrados só sobra a opção de informar um aluno', () => {
    expect(buildStudentOptions([])).toEqual([
      { value: NEW_STUDENT_CHOICE, label: 'Informar outro aluno' },
    ]);
  });
});

describe('studentFieldsFor', () => {
  it('copia nome, ano e preferência de um aluno cadastrado', () => {
    expect(studentFieldsFor('student-1', [LUCAS, MARIA])).toEqual({
      studentName: 'Lucas Martins',
      schoolGrade: 'elementary_7',
      tutoringPreference: 'online',
    });
  });

  it('aluno sem preferência de aula fica em "sem preferência"', () => {
    expect(studentFieldsFor('student-2', [LUCAS, MARIA]).tutoringPreference).toBe('any');
  });

  it('"outro aluno" limpa os campos', () => {
    expect(studentFieldsFor(NEW_STUDENT_CHOICE, [LUCAS])).toEqual({
      studentName: '',
      schoolGrade: undefined,
      tutoringPreference: 'any',
    });
  });
});

describe('buildDefaultValues', () => {
  it('começa pelo primeiro aluno cadastrado', () => {
    expect(buildDefaultValues('Juliana Martins', [LUCAS, MARIA])).toEqual({
      guardianName: 'Juliana Martins',
      studentChoice: 'student-1',
      studentName: 'Lucas Martins',
      schoolGrade: 'elementary_7',
      tutoringPreference: 'online',
      studentAge: '',
      reason: '',
    });
  });

  it('sem alunos cadastrados começa em "outro aluno", com os campos vazios', () => {
    expect(buildDefaultValues('Juliana Martins', [])).toEqual({
      guardianName: 'Juliana Martins',
      studentChoice: NEW_STUDENT_CHOICE,
      studentName: '',
      schoolGrade: undefined,
      tutoringPreference: 'any',
      studentAge: '',
      reason: '',
    });
  });
});

describe('toContactRequestPayload', () => {
  it('monta as colunas de contact_requests e liga o aluno cadastrado', () => {
    expect(toContactRequestPayload('teacher-1', VALUES)).toEqual({
      teacher_id: 'teacher-1',
      student_id: 'student-1',
      guardian_name: 'Juliana Martins',
      student_name: 'Lucas Martins',
      student_school_grade: 'elementary_7',
      student_age: 12,
      reason: 'Reforço em frações.',
      preferred_tutoring_type: 'online',
    });
  });

  it('"outro aluno" vai sem student_id, e idade e preferência vazias viram null', () => {
    const payload = toContactRequestPayload('teacher-1', {
      ...VALUES,
      studentChoice: NEW_STUDENT_CHOICE,
      studentAge: '',
      tutoringPreference: 'any',
    });

    expect(payload.student_id).toBeNull();
    expect(payload.student_age).toBeNull();
    expect(payload.preferred_tutoring_type).toBeNull();
  });

  it('não envia guardian_id (vem do auth.uid() no banco)', () => {
    expect(toContactRequestPayload('teacher-1', VALUES)).not.toHaveProperty('guardian_id');
  });
});

describe('formatResponseDeadline', () => {
  it('usa o nome do professor', () => {
    expect(formatResponseDeadline('Mariana Alves')).toBe(
      'Mariana Alves tem até 24 horas para responder.',
    );
  });

  it('sem nome, fica genérico', () => {
    expect(formatResponseDeadline()).toBe('O professor tem até 24 horas para responder.');
    expect(formatResponseDeadline('  ')).toBe('O professor tem até 24 horas para responder.');
  });
});