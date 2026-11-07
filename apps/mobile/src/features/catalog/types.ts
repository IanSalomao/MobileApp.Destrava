import type { Enums, Tables } from '@/lib/database.types';

// Idioma do catálogo (ex.: "Inglês"). Dado de referência, só leitura; entra por migração.
export type Language = Pick<Tables<'languages'>, 'id' | 'name'>;

export type SchoolGrade = Enums<'school_grade'>;
export type DayPeriod = Enums<'day_period'>;
export type TutoringType = Enums<'tutoring_type'>;
export type EducationLevel = Enums<'education_level'>;

// Rótulos pt-BR dos enums do banco. Mantêm o glossário do projeto (um termo por conceito).

export const SCHOOL_GRADE_LABELS: Record<SchoolGrade, string> = {
  elementary_1: '1º ano do Ensino Fundamental',
  elementary_2: '2º ano do Ensino Fundamental',
  elementary_3: '3º ano do Ensino Fundamental',
  elementary_4: '4º ano do Ensino Fundamental',
  elementary_5: '5º ano do Ensino Fundamental',
  elementary_6: '6º ano do Ensino Fundamental',
  elementary_7: '7º ano do Ensino Fundamental',
  elementary_8: '8º ano do Ensino Fundamental',
  elementary_9: '9º ano do Ensino Fundamental',
  high_school_1: '1ª série do Ensino Médio',
  high_school_2: '2ª série do Ensino Médio',
  high_school_3: '3ª série do Ensino Médio',
};

export const SCHOOL_GRADES = Object.keys(SCHOOL_GRADE_LABELS) as SchoolGrade[];

export const DAY_PERIOD_LABELS: Record<DayPeriod, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  evening: 'Noite',
};

export const DAY_PERIODS = Object.keys(DAY_PERIOD_LABELS) as DayPeriod[];

export const TUTORING_TYPE_LABELS: Record<TutoringType, string> = {
  in_person: 'Presencial',
  online: 'Online',
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  elementary_early: 'Anos iniciais (1º a 5º)',
  elementary_late: 'Fundamental II (6º a 9º)',
  high_school: 'Ensino Médio',
};

/** Opções {value,label} para o SelectField de ano escolar. */
export const SCHOOL_GRADE_OPTIONS = SCHOOL_GRADES.map((value) => ({
  value,
  label: SCHOOL_GRADE_LABELS[value],
}));
