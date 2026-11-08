import { z } from 'zod';

import { BRAZILIAN_STATES } from '@/features/catalog/types';
import { currencyToCents } from '@/lib/masks';
import { isValidCpf } from '@/lib/cpf';

// Campos de texto e seleção do cadastro profissional (os arquivos ficam em estado próprio no hook).
// Os refinamentos espelham o que submit_teacher_profile exige, para o erro aparecer antes do envio.
export const teacherProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Informe seu nome.').max(120, 'Use no máximo 120 caracteres.'),
  cpf: z.string().refine(isValidCpf, 'Informe um CPF válido.'),
  // Estado e cidade vêm de listas predefinidas: enum brazilian_state e tabela cities (IBGE).
  state: z.enum(BRAZILIAN_STATES, { message: 'Selecione o estado.' }),
  cityId: z.number({ message: 'Selecione a cidade.' }).int(),
  subjectIds: z.array(z.string()).min(1, 'Selecione ao menos uma matéria.'),
  languageIds: z.array(z.string()).min(1, 'Selecione ao menos um idioma.'),
  bio: z.string().trim().max(1000, 'Use no máximo 1000 caracteres.').optional(),
  tutoringTypes: z
    .array(z.enum(['in_person', 'online']))
    .min(1, 'Escolha ao menos um tipo de aula.'),
  hourlyRate: z
    .string()
    .refine((value) => (currencyToCents(value) ?? 0) > 0, 'Informe o valor por hora.')
    // Mesmo limite do banco (teachers.hourly_rate_cents <= 100000 = R$ 1.000,00).
    .refine(
      (value) => (currencyToCents(value) ?? 0) <= 100000,
      'Valor máximo de R$ 1.000,00 por hora.',
    ),
  weekdays: z.array(z.number()).min(1, 'Selecione ao menos um dia.'),
  periods: z
    .array(z.enum(['morning', 'afternoon', 'evening']))
    .min(1, 'Selecione ao menos um período.'),
});

export type TeacherProfileInput = z.infer<typeof teacherProfileSchema>;

// Campos validados ao avançar cada etapa do formulário.
export const TEACHER_STEP_FIELDS = {
  1: ['fullName', 'cpf', 'state', 'cityId'],
  2: ['subjectIds', 'languageIds', 'bio'],
  3: ['tutoringTypes', 'hourlyRate', 'weekdays', 'periods'],
} as const satisfies Record<number, readonly (keyof TeacherProfileInput)[]>;
