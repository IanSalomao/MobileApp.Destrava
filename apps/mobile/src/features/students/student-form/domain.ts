import type { StudentProfileInput } from '../schemas';
import type { StudentDetail } from './types';

// Regras puras da tela "Aluno" (cadastro e edição). Sem React e sem Supabase.

/** Valor do parâmetro `id` da rota `/students/[id]` que cadastra um aluno novo. */
export const NEW_STUDENT_ID = 'new';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type StudentRoute =
  | { mode: 'new' }
  | { mode: 'edit'; studentId: string }
  | { mode: 'invalid' };

/**
 * Lê o parâmetro `id` da rota. "new" cadastra, um uuid edita e qualquer outra coisa é inválida,
 * o que evita ir ao banco com um id que ele recusaria (ex.: o link provisório "exemplo").
 */
export function parseStudentRoute(param: string | string[] | undefined): StudentRoute {
  const id = Array.isArray(param) ? param[0] : param;

  if (id === NEW_STUDENT_ID) return { mode: 'new' };
  if (id && UUID_PATTERN.test(id)) return { mode: 'edit', studentId: id };
  return { mode: 'invalid' };
}

/** Valores iniciais do formulário ao editar um aluno que já existe. */
export function toFormValues(student: StudentDetail): StudentProfileInput {
  return {
    fullName: student.fullName,
    schoolGrade: student.schoolGrade,
    subjectIds: [...student.subjectIds],
    learningGoal: student.learningGoal ?? '',
  };
}

/** Objetivo em branco vira null no banco, como no cadastro do onboarding. */
export function normalizeLearningGoal(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** O que mudou nas matérias de interesse: quais vincular e quais desvincular. */
export function diffSubjects(
  current: readonly string[],
  next: readonly string[],
): { toAdd: string[]; toRemove: string[] } {
  return {
    toAdd: next.filter((id) => !current.includes(id)),
    toRemove: current.filter((id) => !next.includes(id)),
  };
}