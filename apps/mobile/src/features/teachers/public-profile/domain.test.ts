import {
  formatEducationLevels,
  formatLocation,
  formatPeriods,
  formatRatingSummary,
  formatTutoringTypes,
  formatWeekdays,
  isValidTeacherId,
  toPublicTeacherProfile,
  type PublicTeacherRow,
} from './domain';

const baseRow: PublicTeacherRow = {
  id: '11111111-1111-4111-8111-111111111111',
  bio: '  Professora de reforço.  ',
  hourly_rate_cents: 6500,
  tutoring_types: ['online'],
  education_levels: ['high_school'],
  available_weekdays: [1, 3],
  available_periods: ['morning'],
  neighborhood: 'Centro',
  state: 'SP',
  rating_average: 4.5,
  rating_count: 2,
  profiles: { full_name: 'Mariana Silva', avatar_url: 'https://exemplo.com/a.png' },
  cities: { name: 'São Paulo' },
  teacher_subjects: [
    { subjects: { id: 'physics', name: 'Física', sort_order: 2 } },
    { subjects: { id: 'math', name: 'Matemática', sort_order: 1 } },
  ],
  teacher_languages: [{ languages: { id: 'english', name: 'Inglês', sort_order: 1 } }],
};

describe('isValidTeacherId', () => {
  it('aceita uuid e recusa ids de exemplo das rotas provisórias', () => {
    expect(isValidTeacherId('11111111-1111-4111-8111-111111111111')).toBe(true);
    expect(isValidTeacherId('exemplo')).toBe(false);
    expect(isValidTeacherId('')).toBe(false);
  });
});

describe('formatLocation', () => {
  it('junta bairro e cidade/UF', () => {
    expect(formatLocation('Centro', 'São Paulo', 'SP')).toBe('Centro · São Paulo/SP');
  });

  it('pula o que não foi preenchido', () => {
    expect(formatLocation(null, 'São Paulo', null)).toBe('São Paulo');
    expect(formatLocation('Centro', null, 'SP')).toBe('Centro');
    expect(formatLocation(null, null, null)).toBeNull();
  });
});

describe('formatWeekdays', () => {
  it('ordena, remove repetidos e ignora dias inválidos', () => {
    expect(formatWeekdays([5, 1, 1, 9, -1, 0])).toEqual(['Dom', 'Seg', 'Sex']);
  });
});

describe('listas de rótulos', () => {
  it('mantêm uma ordem fixa', () => {
    expect(formatPeriods(['evening', 'morning'])).toEqual(['Manhã', 'Noite']);
    expect(formatEducationLevels(['high_school', 'elementary_early'])).toEqual([
      'Fundamental I (1º ao 5º ano)',
      'Ensino médio',
    ]);
    expect(formatTutoringTypes(['in_person', 'online'])).toEqual(['Online', 'Presencial']);
  });
});

describe('formatRatingSummary', () => {
  it('trata zero, um e vários', () => {
    expect(formatRatingSummary(0)).toBe('Ainda sem avaliações');
    expect(formatRatingSummary(1)).toBe('1 avaliação');
    expect(formatRatingSummary(18)).toBe('18 avaliações');
  });
});

describe('toPublicTeacherProfile', () => {
  it('converte a linha do banco no modelo da tela', () => {
    const profile = toPublicTeacherProfile(baseRow);

    expect(profile).toMatchObject({
      id: baseRow.id,
      fullName: 'Mariana Silva',
      avatarUrl: 'https://exemplo.com/a.png',
      bio: 'Professora de reforço.',
      hourlyRateCents: 6500,
      cityName: 'São Paulo',
      ratingAverage: 4.5,
      ratingCount: 2,
    });
    expect(profile.subjects.map((s) => s.id)).toEqual(['math', 'physics']);
    expect(profile.languages).toEqual([{ id: 'english', name: 'Inglês' }]);
  });

  it('lida com dados ausentes', () => {
    const profile = toPublicTeacherProfile({
      ...baseRow,
      bio: '   ',
      profiles: null,
      cities: null,
      teacher_subjects: [{ subjects: null }],
      teacher_languages: [],
      rating_average: null,
      rating_count: 0,
    });

    expect(profile.fullName).toBe('Professor');
    expect(profile.avatarUrl).toBeNull();
    expect(profile.bio).toBeNull();
    expect(profile.cityName).toBeNull();
    expect(profile.subjects).toEqual([]);
    expect(profile.ratingAverage).toBeNull();
  });
});
