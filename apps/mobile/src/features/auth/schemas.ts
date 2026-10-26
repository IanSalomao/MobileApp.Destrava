import { z } from 'zod';

import { USER_ROLES, type UserRole } from '@/features/profile/types';

// Mesmo mínimo configurado em supabase/config.toml (auth.minimum_password_length).
export const MIN_PASSWORD_LENGTH = 8;

const email = z.string().trim().toLowerCase().email('Informe um e-mail válido.');

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Informe a senha.'),
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'Informe seu nome.').max(120, 'Use no máximo 120 caracteres.'),
  email,
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`),
  role: z.enum(USER_ROLES, { message: 'Escolha como você vai usar o Destrava.' }),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

// Perfil vindo da rota (/sign-up?role=teacher). Valor ausente ou inválido = sem pré-seleção.
export function parseRoleParam(value: unknown): UserRole | undefined {
  return USER_ROLES.find((role) => role === value);
}
