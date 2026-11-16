import { supabase } from '@/lib/supabase';

import { getPublicTeacherProfile } from './api';
import type { PublicTeacherRow } from './domain';

// Camada de dados: testamos mockando a única porta do Supabase (@/lib/supabase).
jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const mockFrom = supabase.from as jest.Mock;

const TEACHER_ID = '11111111-1111-4111-8111-111111111111';

const row: PublicTeacherRow = {
  id: TEACHER_ID,
  bio: 'Bio',
  hourly_rate_cents: 5000,
  tutoring_types: ['online'],
  education_levels: [],
  available_weekdays: [],
  available_periods: [],
  neighborhood: null,
  state: 'SP',
  rating_average: null,
  rating_count: 0,
  profiles: { full_name: 'Ana Souza', avatar_url: null },
  cities: { name: 'Campinas' },
  teacher_subjects: [],
  teacher_languages: [],
};

function mockQuery(result: { data: unknown; error: unknown }) {
  const maybeSingle = jest.fn().mockResolvedValue(result);
  const eq = jest.fn().mockReturnValue({ maybeSingle });
  const select = jest.fn().mockReturnValue({ eq });
  mockFrom.mockReturnValue({ select });
  return { select, eq, maybeSingle };
}

describe('getPublicTeacherProfile', () => {
  afterEach(() => jest.clearAllMocks());

  it('busca o professor pelo id e devolve o modelo da tela', async () => {
    const { eq } = mockQuery({ data: row, error: null });

    const profile = await getPublicTeacherProfile(TEACHER_ID);

    expect(mockFrom).toHaveBeenCalledWith('teachers');
    expect(eq).toHaveBeenCalledWith('id', TEACHER_ID);
    expect(profile?.fullName).toBe('Ana Souza');
    expect(profile?.cityName).toBe('Campinas');
  });

  it('devolve null quando o professor não existe ou não está visível', async () => {
    mockQuery({ data: null, error: null });

    await expect(getPublicTeacherProfile(TEACHER_ID)).resolves.toBeNull();
  });

  it('devolve null sem consultar o banco quando o id não é um uuid', async () => {
    await expect(getPublicTeacherProfile('exemplo')).resolves.toBeNull();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('propaga o erro do Supabase em vez de engolir', async () => {
    const error = new Error('falha de rede');
    mockQuery({ data: null, error });

    await expect(getPublicTeacherProfile(TEACHER_ID)).rejects.toBe(error);
  });
});
