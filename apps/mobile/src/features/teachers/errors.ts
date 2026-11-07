import { getDbErrorCode, getDbErrorDetails, translateDbError } from '@/lib/db-errors';

// Erros do cadastro profissional (RPC submit_teacher_profile e escritas relacionadas).
const TEACHER_ERROR_MESSAGES: Record<string, string> = {
  not_a_teacher: 'Apenas professores podem enviar o perfil.',
  verification_already_submitted: 'Seu perfil já foi enviado para análise.',
};

// Rótulos dos campos que faltam, vindos no detail de teacher_profile_incomplete.
const MISSING_FIELD_LABELS: Record<string, string> = {
  full_name: 'nome completo',
  cpf: 'CPF',
  identity_document: 'documento com foto',
  location: 'cidade e estado',
  subjects: 'matérias',
  languages: 'idiomas',
  tutoring_types: 'tipo de aula',
  hourly_rate: 'valor por hora',
  availability: 'dias e períodos disponíveis',
};

export function getTeacherErrorMessage(error: unknown): string {
  if (getDbErrorCode(error) === 'teacher_profile_incomplete') {
    const fields = (getDbErrorDetails(error) ?? '')
      .split(',')
      .map((field) => MISSING_FIELD_LABELS[field.trim()] ?? field.trim())
      .filter(Boolean);
    return fields.length
      ? `Complete seu cadastro: ${fields.join(', ')}.`
      : 'Complete seu cadastro antes de enviar.';
  }

  return translateDbError(error, TEACHER_ERROR_MESSAGES);
}
