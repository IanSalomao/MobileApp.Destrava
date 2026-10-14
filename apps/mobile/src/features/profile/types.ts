import type { Enums, Tables } from '@/lib/database.types';

export type UserRole = Enums<'user_role'>;

export type Profile = Pick<Tables<'profiles'>, 'id' | 'role' | 'full_name' | 'avatar_url'>;

export const USER_ROLES = ['guardian', 'teacher'] as const satisfies readonly UserRole[];

export const ROLE_LABELS: Record<UserRole, string> = {
  guardian: 'Pai ou responsável',
  teacher: 'Professor',
};
