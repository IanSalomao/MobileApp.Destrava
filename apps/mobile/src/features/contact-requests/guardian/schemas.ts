import { z } from 'zod';

import { SCHOOL_GRADES, type SchoolGrade } from '@/features/catalog/types';

// Valor especial do campo "Aluno": o responsável vai informar outro aluno, sem usar um cadastrado.
export const NEW_STUDENT_CHOICE = 'new';

export const REASON_MAX_LENGTH = 1000;
export const STUDENT_AGE_MIN = 3;
export const STUDENT_AGE_MAX = 25;

// "any" = sem preferência, que vira null no banco (preferred_tutoring_type).
export const TUTORING_PREFERENCES = ['any', 'online', 'in_person'] as const;

// Idade é opcional; vazia vale. O banco aceita de 3 a 25 anos (contact_requests.student_age).
function isValidStudentAge(value: string): boolean {
  if (value === '') return true;
  if (!/^\d+$/.test(value)) return false;
  const age = Number(value);
  return age >= STUDENT_AGE_MIN && age <= STUDENT_AGE_MAX;
}

// Formulário "Solicitar contato" (RF07): dados do responsável, do aluno e motivo do reforço.
export const contactRequestSchema = z.object({
  guardianName: z
    .string()
    .trim()
    .min(1, 'Informe o seu nome.')
    .max(120, 'Use no máximo 120 caracteres.'),
  studentChoice: z.string().min(1, 'Selecione o aluno.'),
  studentName: z
    .string()
    .trim()
    .min(1, 'Informe o nome do aluno.')
    .max(120, 'Use no máximo 120 caracteres.'),
  schoolGrade: z.enum(SCHOOL_GRADES as [SchoolGrade, ...SchoolGrade[]], {
    message: 'Selecione o ano escolar.',
  }),
  studentAge: z
    .string()
    .trim()
    .refine(
      isValidStudentAge,
      `Informe uma idade entre ${STUDENT_AGE_MIN} e ${STUDENT_AGE_MAX} anos.`,
    ),
  tutoringPreference: z.enum(TUTORING_PREFERENCES),
  reason: z
    .string()
    .trim()
    .min(1, 'Conte o motivo do reforço.')
    .max(REASON_MAX_LENGTH, `Use no máximo ${REASON_MAX_LENGTH} caracteres.`),
});

export type ContactRequestFormValues = z.infer<typeof contactRequestSchema>;