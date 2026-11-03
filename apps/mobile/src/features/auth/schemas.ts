import { z } from 'zod';

import { USER_ROLES, type UserRole } from '@/features/profile/types';

import { MINOR_DATA_REQUIRED_MESSAGE, TERMS_REQUIRED_MESSAGE } from './consent';

// Mesmo mínimo configurado em supabase/config.toml (auth.minimum_password_length).
export const MIN_PASSWORD_LENGTH = 8;

const email = z.string().trim().toLowerCase().email('Informe um e-mail válido.');

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Informe a senha.'),
});

export const forgotPasswordSchema = z.object({ email });

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Informe seu nome.')
      .max(120, 'Use no máximo 120 caracteres.'),
    email,
    password: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH,
        `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      ),
    role: z.enum(USER_ROLES, { message: 'Escolha como você vai usar o Destrava.' }),
    // AUT-09: sem o aceite a conta não é criada (o banco também recusa, como segunda barreira).
    termsAccepted: z.boolean().refine((accepted) => accepted, { message: TERMS_REQUIRED_MESSAGE }),
    minorDataConsent: z.boolean(),
  })
  // Responsável precisa autorizar também o uso dos dados do aluno menor de idade.
  .refine((data) => data.role !== 'guardian' || data.minorDataConsent, {
    path: ['minorDataConsent'],
    message: MINOR_DATA_REQUIRED_MESSAGE,
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

// Perfil vindo da rota (/sign-up?role=teacher). Valor ausente ou inválido = sem pré-seleção.
export function parseRoleParam(value: unknown): UserRole | undefined {
  return USER_ROLES.find((role) => role === value);
}
