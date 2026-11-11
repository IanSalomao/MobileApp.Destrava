import type { TeacherSearchResultRow } from '../types';
import {
  countActiveFilters,
  escalateTeachersByNeighborhood,
  extractAvailableNeighborhoods,
} from './neighborhood-escalation';

function makeTeacher(
  overrides: Partial<TeacherSearchResultRow> & { id: string; full_name: string },
): TeacherSearchResultRow {
  return {
    avatar_url: '',
    subject_ids: ['math'],
    language_ids: ['pt'],
    education_levels: ['elementary_late'],
    tutoring_types: ['in_person'],
    hourly_rate_cents: 6000,
    neighborhood: 'Pinheiros',
    city_id: 3550308,
    city_name: 'São Paulo',
    state: 'SP',
    rating_average: 4.8,
    rating_count: 10,
    is_favorite: false,
    total_count: 3,
    ...overrides,
  };
}
describe('neighborhood-escalation domain', () => {
  const teachers: TeacherSearchResultRow[] = [
    makeTeacher({
      id: '1',
      full_name: 'Mariana',
      neighborhood: 'Pinheiros',
      rating_average: 5.0,
    }),
    makeTeacher({
      id: '2',
      full_name: 'Rafael',
      neighborhood: 'Vila Mariana',
      rating_average: 4.9,
    }),
    makeTeacher({
      id: '3',
      full_name: 'Camila',
      neighborhood: 'Moema',
      rating_average: 4.7,
    }),
  ];

  it('extrai bairros únicos já cadastrados na cidade em ordem alfabética e sem duplicatas', () => {
    const list = [
      ...teachers,
      makeTeacher({ id: '4', full_name: 'Lucas', neighborhood: 'pinheiros' }),
    ];

    expect(extractAvailableNeighborhoods(list)).toEqual(['Moema', 'Pinheiros', 'Vila Mariana']);
  });

  it('escalona trazendo primeiro os professores do mesmo bairro e em seguida os demais da mesma cidade', () => {
    const result = escalateTeachersByNeighborhood(teachers, ['Moema'], 'prioritize');

    expect(result.map((t: TeacherSearchResultRow) => t.full_name)).toEqual([
      'Camila',
      'Mariana',
      'Rafael',
    ]);
  });

  it('filtra estritamente pelo bairro quando o modo é strict', () => {
    const result = escalateTeachersByNeighborhood(teachers, ['Vila Mariana'], 'strict');

    expect(result.map((t: TeacherSearchResultRow) => t.full_name)).toEqual(['Rafael']);
  });

  it('conta corretamente a quantidade de filtros ativos', () => {
    expect(
      countActiveFilters({
        subjectIds: ['math'],
        languageIds: [],
        tutoringTypes: ['online'],
        minHourlyRateCents: null,
        maxHourlyRateCents: 8000,
        weekdays: [],
        neighborhoods: ['Moema'],
      }),
    ).toBe(4);
  });
});
