import { supabase } from '@/lib/supabase';

import {
  getMyTeacherProfile,
  saveAndSubmitTeacherProfile,
  updateTeacherProfile,
  type SaveTeacherProfileParams,
} from './api';

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), storage: { from: jest.fn() } },
}));

jest.mock('@/lib/storage', () => ({
  uploadToBucket: jest.fn(async ({ path }: { path: string }) => path),
}));

const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;

type Call = { table: string; method: string; args: unknown[] };

// Builder encadeável do supabase-js: cada método devolve o próprio builder, que é "thenable" e
// resolve com o resultado configurado para a tabela. Registra as chamadas para as asserções.
function mockTables(results: Record<string, { data?: unknown; error?: unknown }> = {}) {
  const calls: Call[] = [];
  mockFrom.mockImplementation((table: string) => {
    const result = { data: null, error: null, ...results[table] };
    const builder: Record<string, unknown> = {
      then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
        Promise.resolve(result).then(resolve, reject),
    };
    for (const method of ['select', 'update', 'insert', 'delete', 'eq', 'single']) {
      builder[method] = (...args: unknown[]) => {
        calls.push({ table, method, args });
        return builder;
      };
    }
    return builder;
  });
  return calls;
}

const PARAMS: SaveTeacherProfileParams = {
  teacherId: 't1',
  fullName: 'Mariana Alves',
  cpf: '529.982.247-25',
  state: 'SP',
  cityId: 3550308,
  subjectIds: ['math'],
  languageIds: ['pt', 'en'],
  bio: '  Aulas práticas.  ',
  tutoringTypes: ['online'],
  hourlyRateCents: 6500,
  weekdays: [1, 3],
  periods: ['morning'],
  socialLink: { network: 'instagram', url: 'instagram.com/mariana' },
};

function methodsOn(calls: Call[], table: string) {
  return calls.filter((call) => call.table === table).map((call) => call.method);
}

describe('updateTeacherProfile', () => {
  afterEach(() => jest.clearAllMocks());

  it('com a verificação aprovada, não mexe no CPF nem reenvia para análise', async () => {
    const calls = mockTables();

    await expect(updateTeacherProfile({ ...PARAMS, verificationStatus: 'approved' })).resolves.toBe(
      'approved',
    );

    expect(methodsOn(calls, 'teacher_verifications')).toEqual([]);
    expect(mockRpc).not.toHaveBeenCalled();
    expect(calls).toContainEqual({
      table: 'teachers',
      method: 'update',
      args: [
        {
          bio: 'Aulas práticas.',
          hourly_rate_cents: 6500,
          tutoring_types: ['online'],
          available_weekdays: [1, 3],
          available_periods: ['morning'],
          state: 'SP',
          city_id: 3550308,
        },
      ],
    });
  });

  it('troca o link de rede social, normalizando para https', async () => {
    const calls = mockTables();

    await updateTeacherProfile({ ...PARAMS, verificationStatus: 'approved' });

    expect(methodsOn(calls, 'teacher_social_links')).toEqual(['delete', 'eq', 'insert']);
    expect(calls).toContainEqual({
      table: 'teacher_social_links',
      method: 'insert',
      args: [{ teacher_id: 't1', network: 'instagram', url: 'https://instagram.com/mariana' }],
    });
  });

  it('sem link, só apaga o que estava salvo', async () => {
    const calls = mockTables();

    await updateTeacherProfile({ ...PARAMS, socialLink: null, verificationStatus: 'approved' });

    expect(methodsOn(calls, 'teacher_social_links')).toEqual(['delete', 'eq']);
  });

  it('com a verificação em rascunho, grava o CPF e envia para análise', async () => {
    const calls = mockTables();
    mockRpc.mockResolvedValue({ data: 'approved', error: null });

    await expect(updateTeacherProfile({ ...PARAMS, verificationStatus: 'draft' })).resolves.toBe(
      'approved',
    );

    expect(calls).toContainEqual({
      table: 'teacher_verifications',
      method: 'update',
      args: [{ cpf: '52998224725' }],
    });
    expect(mockRpc).toHaveBeenCalledWith('submit_teacher_profile');
  });

  it('propaga o erro do Supabase', async () => {
    const error = new Error('falha');
    mockTables({ teachers: { error } });

    await expect(updateTeacherProfile({ ...PARAMS, verificationStatus: 'approved' })).rejects.toBe(
      error,
    );
  });
});

describe('saveAndSubmitTeacherProfile', () => {
  afterEach(() => jest.clearAllMocks());

  it('grava matérias e idiomas e envia para análise', async () => {
    const calls = mockTables();
    mockRpc.mockResolvedValue({ data: 'approved', error: null });

    await expect(saveAndSubmitTeacherProfile(PARAMS)).resolves.toBe('approved');

    expect(calls).toContainEqual({
      table: 'teacher_languages',
      method: 'insert',
      args: [
        [
          { teacher_id: 't1', language_id: 'pt' },
          { teacher_id: 't1', language_id: 'en' },
        ],
      ],
    });
  });

  it('propaga o erro do envio para análise', async () => {
    mockTables();
    const error = { message: 'teacher_profile_incomplete' };
    mockRpc.mockResolvedValue({ data: null, error });

    await expect(saveAndSubmitTeacherProfile(PARAMS)).rejects.toBe(error);
  });
});

describe('getMyTeacherProfile', () => {
  afterEach(() => jest.clearAllMocks());

  it('converte a linha do banco no perfil do professor', async () => {
    mockTables({
      teachers: {
        data: {
          id: 't1',
          bio: null,
          hourly_rate_cents: 6500,
          tutoring_types: ['online', 'in_person'],
          available_weekdays: [1],
          available_periods: ['evening'],
          state: 'SP',
          city_id: 3550308,
          is_published: true,
          rating_average: 4.5,
          rating_count: 2,
          profiles: { full_name: 'Mariana Alves', avatar_url: 'https://cdn/a.png' },
          cities: { name: 'São Paulo' },
          teacher_subjects: [
            { subjects: { id: 'physics', name: 'Física', sort_order: 2 } },
            { subjects: { id: 'math', name: 'Matemática', sort_order: 1 } },
            { subjects: null },
          ],
          teacher_languages: [{ languages: { id: 'pt', name: 'Português', sort_order: 1 } }],
          teacher_social_links: [{ network: 'instagram', url: 'https://instagram.com/m' }],
          teacher_verifications: { status: 'approved', cpf: '52998224725' },
          teacher_documents: [
            { kind: 'certificate', file_name: 'diploma.pdf', created_at: '2026-11-01T00:00:00Z' },
            { kind: 'identity', file_name: 'rg-antigo.pdf', created_at: '2026-10-01T00:00:00Z' },
            { kind: 'identity', file_name: 'rg.pdf', created_at: '2026-11-02T00:00:00Z' },
          ],
        },
      },
    });

    const profile = await getMyTeacherProfile('t1');

    expect(profile).toMatchObject({
      fullName: 'Mariana Alves',
      avatarUrl: 'https://cdn/a.png',
      cityName: 'São Paulo',
      ratingAverage: 4.5,
      subjects: [
        { id: 'math', name: 'Matemática' },
        { id: 'physics', name: 'Física' },
      ],
      verificationStatus: 'approved',
      identityDocumentName: 'rg.pdf',
      certificateNames: ['diploma.pdf'],
    });
  });

  it('usa padrões quando faltam perfil, cidade e verificação', async () => {
    mockTables({
      teachers: {
        data: {
          id: 't1',
          bio: null,
          hourly_rate_cents: null,
          tutoring_types: [],
          available_weekdays: [],
          available_periods: [],
          state: null,
          city_id: null,
          is_published: false,
          rating_average: null,
          rating_count: 0,
          profiles: null,
          cities: null,
          teacher_subjects: [],
          teacher_languages: [],
          teacher_social_links: [],
          teacher_verifications: null,
          teacher_documents: [],
        },
      },
    });

    await expect(getMyTeacherProfile('t1')).resolves.toMatchObject({
      fullName: '',
      cityName: null,
      ratingAverage: null,
      verificationStatus: 'draft',
      cpf: null,
      identityDocumentName: null,
    });
  });

  it('propaga o erro do Supabase', async () => {
    const error = new Error('falha');
    mockTables({ teachers: { error } });

    await expect(getMyTeacherProfile('t1')).rejects.toBe(error);
  });
});
