import type { Enums, Tables } from '@/lib/database.types';

export type UserRole = Enums<'user_role'>;

export type Profile = Pick<Tables<'profiles'>, 'id' | 'role' | 'full_name' | 'avatar_url'>;

/** Dados editáveis da conta, como vão para o banco: celular já em E.164 (ex.: +5511999991234). */
export type AccountValues = Readonly<{
  fullName: string;
  phone: string;
}>;

export const USER_ROLES = ['guardian', 'teacher'] as const satisfies readonly UserRole[];

export const ROLE_LABELS: Record<UserRole, string> = {
  guardian: 'Pai ou responsável',
  teacher: 'Professor',
};
