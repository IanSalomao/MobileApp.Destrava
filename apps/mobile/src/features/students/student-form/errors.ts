import { translateDbError } from '@/lib/db-errors';

// Erros da tela "Aluno": carregar e salvar um aluno do responsável.
const STUDENT_ERROR_MESSAGES: Record<string, string> = {
  student_not_found: 'Aluno não encontrado.',
};

export function getStudentErrorMessage(error: unknown): string {
  return translateDbError(error, STUDENT_ERROR_MESSAGES);
}
