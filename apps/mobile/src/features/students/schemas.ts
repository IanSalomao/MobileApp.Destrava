import { z } from 'zod';

import { SCHOOL_GRADES, type SchoolGrade } from '@/features/catalog/types';

export const studentProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Informe o nome do aluno.')
    .max(120, 'Use no máximo 120 caracteres.'),
  schoolGrade: z.enum(SCHOOL_GRADES as [SchoolGrade, ...SchoolGrade[]], {
    message: 'Selecione o ano escolar.',
  }),
  subjectIds: z.array(z.string()).min(1, 'Selecione ao menos uma matéria.'),
  learningGoal: z.string().trim().max(500, 'Use no máximo 500 caracteres.').optional(),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;
