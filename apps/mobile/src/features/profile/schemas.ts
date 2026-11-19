import { z } from 'zod';

import { isValidBRPhone } from '@/lib/phone';

// "Seus dados" no Meu perfil do responsável: nome (profiles.full_name, até 120 caracteres, como o
// check do banco) e celular com DDD (contact_details.phone, salvo em E.164). O e-mail é só leitura.
export const guardianAccountSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Informe seu nome completo.')
    .max(120, 'Use no máximo 120 caracteres.'),
  phone: z.string().trim().refine(isValidBRPhone, 'Informe um celular válido com DDD.'),
});

export type GuardianAccountInput = z.infer<typeof guardianAccountSchema>;
