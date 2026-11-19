import { supabase } from '@/lib/supabase';

import { getTeacherContact } from './api';
import { buildTeacherContactMessage, formatSocialLink } from './domain';

// Contato liberado (RF09–RF11): camada de dados e regras puras.
jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const mockFrom = supabase.from as jest.Mock;
const TEACHER_ID = '11111111-1111-4111-8111-111111111111';

// Builder encadeável que resolve com o resultado configurado para cada tabela.
function mockTables(results: Record<string, { data?: unknown; error?: unknown }>) {
  mockFrom.mockImplementation((table: string) => {
    const result = { data: null, error: null, ...results[table] };
    const builder: Record<string, unknown> = {
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
    };
    for (const method of ['select', 'eq', 'in', 'order', 'limit', 'maybeSingle']) {
      builder[method] = () => builder;
    }
    return builder;
  });
}

describe('getTeacherContact', () => {
  afterEach(() => jest.clearAllMocks());

  it('sem solicitação em aberto ou aceita', async () => {
    mockTables({ contact_requests: { data: [] } });
    await expect(getTeacherContact(TEACHER_ID)).resolves.toEqual({ status: 'none' });
  });

  it('id inválido não consulta o banco', async () => {
    await expect(getTeacherContact('abc')).resolves.toEqual({ status: 'none' });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('solicitação pendente', async () => {
    mockTables({ contact_requests: { data: [{ id: 'r1', status: 'pending' }] } });
    await expect(getTeacherContact(TEACHER_ID)).resolves.toEqual({
      status: 'pending',
      requestId: 'r1',
    });
  });

  it('solicitação aceita traz celular e rede social', async () => {
    mockTables({
      contact_requests: { data: [{ id: 'r1', status: 'accepted' }] },
      contact_details: { data: { phone: '+5511999991234' } },
      teacher_social_links: { data: [{ network: 'instagram', url: 'https://instagram.com/a' }] },
    });

    await expect(getTeacherContact(TEACHER_ID)).resolves.toEqual({
      status: 'accepted',
      requestId: 'r1',
      phone: '+5511999991234',
      socialLinks: [{ network: 'instagram', url: 'https://instagram.com/a' }],
    });
  });

  it('aceita sem celular cadastrado', async () => {
    mockTables({
      contact_requests: { data: [{ id: 'r1', status: 'accepted' }] },
      contact_details: { data: null },
      teacher_social_links: { data: [] },
    });

    await expect(getTeacherContact(TEACHER_ID)).resolves.toMatchObject({ phone: null });
  });

  it('propaga os erros do Supabase', async () => {
    const error = new Error('falha');
    mockTables({ contact_requests: { error } });
    await expect(getTeacherContact(TEACHER_ID)).rejects.toBe(error);

    mockTables({
      contact_requests: { data: [{ id: 'r1', status: 'accepted' }] },
      contact_details: { error },
    });
    await expect(getTeacherContact(TEACHER_ID)).rejects.toBe(error);

    mockTables({
      contact_requests: { data: [{ id: 'r1', status: 'accepted' }] },
      teacher_social_links: { error },
    });
    await expect(getTeacherContact(TEACHER_ID)).rejects.toBe(error);
  });
});

describe('regras do contato liberado', () => {
  it('formatSocialLink tira protocolo, www e barra final', () => {
    expect(formatSocialLink('https://www.instagram.com/profa.ana/')).toBe(
      'instagram.com/profa.ana',
    );
  });

  it('buildTeacherContactMessage usa o primeiro nome do professor', () => {
    expect(buildTeacherContactMessage('Ana Ribeiro', 'Juliana Martins')).toBe(
      'Olá, Ana! Sou Juliana Martins e falei com você pelo Destrava.',
    );
    expect(buildTeacherContactMessage('Ana Ribeiro')).toBe(
      'Olá, Ana! Falei com você pelo Destrava.',
    );
    expect(buildTeacherContactMessage('  ', null)).toBe(
      'Olá, professor(a)! Falei com você pelo Destrava.',
    );
  });
});
