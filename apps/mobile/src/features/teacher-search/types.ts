import type { Database } from '@/lib/database.types';

export type TutoringType = Database['public']['Enums']['tutoring_type'];
export type EducationLevel = Database['public']['Enums']['education_level'];
export type BrazilianState = Database['public']['Enums']['brazilian_state'];

export type SearchTeachersRpcArgs = Database['public']['Functions']['search_teachers']['Args'];

export type TeacherSearchResultRow =
  Database['public']['Functions']['search_teachers']['Returns'][number];

export type TeacherSearchLocation = {
  cityId: number;
  cityName: string;
  state: BrazilianState;
  /** Bairros selecionados pelo pai para priorizar/escalonar ou filtrar */
  neighborhoods: string[];
};

export type TeacherSearchFilters = {
  query: string;
  subjectIds: string[];
  languageIds: string[];
  tutoringTypes: TutoringType[];
  minHourlyRateCents: number | null;
  maxHourlyRateCents: number | null;
  weekdays: number[];
  /**
   * 'prioritize': traz primeiro os professores dos bairros escolhidos e depois o restante da cidade (escalonamento)
   * 'strict': exibe apenas professores dos bairros escolhidos
   */
  neighborhoodMode: 'prioritize' | 'strict';
};

export type SearchTeachersParams = {
  cityId?: number | null;
  state?: BrazilianState | null;
  query?: string | null;
  subjectIds?: string[] | null;
  languageIds?: string[] | null;
  tutoringTypes?: TutoringType[] | null;
  minHourlyRateCents?: number | null;
  maxHourlyRateCents?: number | null;
  weekdays?: number[] | null;
  limit?: number;
  offset?: number;
};

export const DEFAULT_SEARCH_LOCATION: TeacherSearchLocation = {
  cityId: 3550308, // IBGE de São Paulo
  cityName: 'São Paulo',
  state: 'SP',
  neighborhoods: [],
};

export const DEFAULT_SEARCH_FILTERS: TeacherSearchFilters = {
  query: '',
  subjectIds: [],
  languageIds: [],
  tutoringTypes: [],
  minHourlyRateCents: null,
  maxHourlyRateCents: null,
  weekdays: [],
  neighborhoodMode: 'prioritize',
};
