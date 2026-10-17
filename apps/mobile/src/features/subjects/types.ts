import type { Tables } from '@/lib/database.types';

/**
 * Matéria do catálogo (ex.: "Matemática").
 * Dado de referência, somente leitura; entra no banco por migração.
 */
export type Subject = Pick<Tables<'subjects'>, 'id' | 'name'>;
