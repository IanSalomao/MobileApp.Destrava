import { TUTORING_TYPE_LABELS, type SchoolGrade } from '@/features/catalog/types';
import type { StudentSummary } from '@/features/students/types';
import type { TablesInsert } from '@/lib/database.types';

import { NEW_STUDENT_CHOICE, type ContactRequestFormValues } from './schemas';

// Regras puras do lado do responsável na solicitação de contato. Sem React e sem Supabase.

/** Prazo que o professor tem para responder (o banco expira a solicitação depois disso). */
export const RESPONSE_DEADLINE_HOURS = 24;

/** Só as colunas que o app pode gravar (grant insert da migração de contact_requests). */
export type ContactRequestPayload = Pick<
  TablesInsert<'contact_requests'>,
  | 'teacher_id'
  | 'student_id'
  | 'guardian_name'
  | 'student_name'
  | 'student_school_grade'
  | 'student_age'
  | 'reason'
  | 'preferred_tutoring_type'
>;

export const TUTORING_PREFERENCE_OPTIONS = [
  { value: 'any', label: 'Sem preferência' },
  { value: 'online', label: TUTORING_TYPE_LABELS.online },
  { value: 'in_person', label: TUTORING_TYPE_LABELS.in_person },
] as const;

type StudentFields = {
  studentName: string;
  schoolGrade: SchoolGrade | undefined;
  tutoringPreference: ContactRequestFormValues['tutoringPreference'];
};

/** Idade em número, ou null quando o campo opcional ficou vazio. */
export function parseStudentAge(value: string): number | null {
  const age = value.trim();
  return age === '' ? null : Number(age);
}

/** Opções do campo "Aluno": os alunos cadastrados mais "Informar outro aluno". */
export function buildStudentOptions(
  students: readonly StudentSummary[],
): { value: string; label: string }[] {
  return [
    ...students.map((student) => ({ value: student.id, label: student.fullName })),
    { value: NEW_STUDENT_CHOICE, label: 'Informar outro aluno' },
  ];
}

/**
 * Campos do aluno que acompanham a escolha no select: um aluno cadastrado preenche nome, ano e
 * preferência de aula; "outro aluno" (ou um id desconhecido) volta tudo ao vazio.
 */
export function studentFieldsFor(
  choice: string,
  students: readonly StudentSummary[],
): StudentFields {
  const student = students.find((item) => item.id === choice);
  if (!student) return { studentName: '', schoolGrade: undefined, tutoringPreference: 'any' };

  return {
    studentName: student.fullName,
    schoolGrade: student.schoolGrade,
    tutoringPreference: student.preferredTutoringType ?? 'any',
  };
}

/** Valores iniciais: nome do responsável e o primeiro aluno cadastrado (se houver). */
export function buildDefaultValues(
  guardianName: string,
  students: readonly StudentSummary[],
): Partial<ContactRequestFormValues> {
  const first = students[0];
  const studentChoice = first ? first.id : NEW_STUDENT_CHOICE;

  return {
    guardianName,
    studentChoice,
    ...studentFieldsFor(studentChoice, students),
    studentAge: '',
    reason: '',
  };
}

/** Converte o formulário validado no que vai para a tabela contact_requests (RF07). */
export function toContactRequestPayload(
  teacherId: string,
  values: ContactRequestFormValues,
): ContactRequestPayload {
  return {
    teacher_id: teacherId,
    student_id: values.studentChoice === NEW_STUDENT_CHOICE ? null : values.studentChoice,
    guardian_name: values.guardianName.trim(),
    student_name: values.studentName.trim(),
    student_school_grade: values.schoolGrade,
    student_age: parseStudentAge(values.studentAge),
    reason: values.reason.trim(),
    preferred_tutoring_type: values.tutoringPreference === 'any' ? null : values.tutoringPreference,
  };
}

/** Texto da confirmação: "Mariana tem até 24 horas para responder." */
export function formatResponseDeadline(teacherName?: string | null): string {
  const who = teacherName?.trim() || 'O professor';
  return `${who} tem até ${RESPONSE_DEADLINE_HOURS} horas para responder.`;
}