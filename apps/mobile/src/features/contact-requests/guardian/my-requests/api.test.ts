import { supabase } from '@/lib/supabase';

import { cancelContactRequest, getMyContactRequest, listMyContactRequests } from './api';

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const mockFrom = supabase.from as jest.Mock;

const ROW = {
  id: 'request-1',
  status: 'pending',
  guardian_id: 'guardian-1',
  teacher_id: 'teacher-1',
  student_name: 'Lucas Martins',
  student_age: 12,
  student_school_grade: 'elementary_7',
  reason: 'Reforço em frações.',
  preferred_tutoring_type: 'online',
  created_at: '2026-11-17T10:00:00.000Z',
  responded_at: null,
  expires_at: '2026-11-18T10:00:00.000Z',
};

const ACCEPTED_ROW = {
  ...ROW,
  id: 'request-2',
  status: 'accepted',
  teacher_id: 'teacher-2',
  responded_at: '2026-11-17T11:00:00.000Z',
};

type Result = { data: unknown; error: unknown };

// Monta o que `supabase.from(tabela)` devolve em cada tabela usada pela api.
function mockTables(tables: {
  requests?: { order?: Result; maybeSingle?: Result };
  profiles?: Result;
  contacts?: Result;
}) {
  const order = jest.fn().mockResolvedValue(tables.requests?.order ?? { data: [], error: null });
  const maybeSingle = jest
    .fn()
    .mockResolvedValue(tables.requests?.maybeSingle ?? { data: null, error: null });
  const requestEq = jest.fn();
  requestEq.mockReturnValue({ eq: requestEq, order, maybeSingle });
  const requestSelect = jest.fn().mockReturnValue({ eq: requestEq });

  const profilesIn = jest.fn().mockResolvedValue(tables.profiles ?? { data: [], error: null });
  const contactsIn = jest.fn().mockResolvedValue(tables.contacts ?? { data: [], error: null });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'contact_requests') return { select: requestSelect };
    if (table === 'profiles') return { select: jest.fn().mockReturnValue({ in: profilesIn }) };
    if (table === 'contact_details') {
      return { select: jest.fn().mockReturnValue({ in: contactsIn }) };
    }
    throw new Error(`tabela inesperada: ${table}`);
  });

  return { order, maybeSingle, requestEq, requestSelect, profilesIn, contactsIn };
}

describe('listMyContactRequests', () => {
  afterEach(() => jest.clearAllMocks());

  it('lê as solicitações do responsável, da mais nova para a mais antiga', async () => {
    const mocks = mockTables({ requests: { order: { data: [ROW], error: null } } });

    await listMyContactRequests('guardian-1');

    expect(mockFrom).toHaveBeenCalledWith('contact_requests');
    expect(mocks.requestEq).toHaveBeenCalledWith('guardian_id', 'guardian-1');
    expect(mocks.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('junta nome e foto do professor e converte as datas', async () => {
    mockTables({
      requests: { order: { data: [ROW], error: null } },
      profiles: {
        data: [{ id: 'teacher-1', full_name: 'Mariana Alves', avatar_url: 'https://img/m.png' }],
        error: null,
      },
    });

    const [request] = await listMyContactRequests('guardian-1');

    expect(request).toEqual({
      id: 'request-1',
      status: 'pending',
      guardianId: 'guardian-1',
      teacherId: 'teacher-1',
      teacherName: 'Mariana Alves',
      teacherAvatarUrl: 'https://img/m.png',
      teacherPhone: null,
      studentName: 'Lucas Martins',
      studentAge: 12,
      schoolGrade: 'elementary_7',
      reason: 'Reforço em frações.',
      preferredTutoringType: 'online',
      createdAt: new Date('2026-11-17T10:00:00.000Z'),
      respondedAt: null,
      expiresAt: new Date('2026-11-18T10:00:00.000Z'),
    });
  });

  it('só busca o celular dos professores que aceitaram', async () => {
    const mocks = mockTables({
      requests: { order: { data: [ROW, ACCEPTED_ROW], error: null } },
      contacts: { data: [{ user_id: 'teacher-2', phone: '+5511999991234' }], error: null },
    });

    const requests = await listMyContactRequests('guardian-1');

    expect(mocks.contactsIn).toHaveBeenCalledWith('user_id', ['teacher-2']);
    expect(requests.map((request) => request.teacherPhone)).toEqual([null, '+5511999991234']);
  });

  it('sem solicitações aceitas não consulta contact_details', async () => {
    mockTables({ requests: { order: { data: [ROW], error: null } } });

    await listMyContactRequests('guardian-1');

    expect(mockFrom).not.toHaveBeenCalledWith('contact_details');
  });

  it('sem solicitações devolve lista vazia e não consulta perfis', async () => {
    mockTables({});

    await expect(listMyContactRequests('guardian-1')).resolves.toEqual([]);
    expect(mockFrom).not.toHaveBeenCalledWith('profiles');
  });

  it('professor sem perfil legível aparece como "Professor"', async () => {
    mockTables({ requests: { order: { data: [ROW], error: null } } });

    const [request] = await listMyContactRequests('guardian-1');

    expect(request.teacherName).toBe('Professor');
  });

  it('deixa o erro do Supabase subir', async () => {
    const error = { message: 'boom' };
    mockTables({ requests: { order: { data: null, error } } });

    await expect(listMyContactRequests('guardian-1')).rejects.toBe(error);
  });
});

describe('getMyContactRequest', () => {
  afterEach(() => jest.clearAllMocks());

  it('lê uma solicitação do responsável', async () => {
    const mocks = mockTables({ requests: { maybeSingle: { data: ROW, error: null } } });

    const request = await getMyContactRequest('guardian-1', 'request-1');

    expect(request.id).toBe('request-1');
    expect(mocks.requestEq).toHaveBeenCalledWith('id', 'request-1');
    expect(mocks.requestEq).toHaveBeenCalledWith('guardian_id', 'guardian-1');
  });

  it('falha com contact_request_not_found quando não existe', async () => {
    mockTables({ requests: { maybeSingle: { data: null, error: null } } });

    await expect(getMyContactRequest('guardian-1', 'nope')).rejects.toThrow(
      'contact_request_not_found',
    );
  });

  it('deixa o erro do Supabase subir', async () => {
    const error = { message: 'boom' };
    mockTables({ requests: { maybeSingle: { data: null, error } } });

    await expect(getMyContactRequest('guardian-1', 'request-1')).rejects.toBe(error);
  });
});

describe('cancelContactRequest', () => {
  afterEach(() => jest.clearAllMocks());

  function mockUpdate(result: Result) {
    const maybeSingle = jest.fn().mockResolvedValue(result);
    const select = jest.fn().mockReturnValue({ maybeSingle });
    const eq = jest.fn();
    eq.mockReturnValue({ eq, select });
    const update = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ update });
    return { update, eq, select };
  }

  it('muda o status para cancelled só se ainda estiver pendente', async () => {
    const mocks = mockUpdate({ data: { id: 'request-1' }, error: null });

    await expect(cancelContactRequest('guardian-1', 'request-1')).resolves.toBeUndefined();

    expect(mockFrom).toHaveBeenCalledWith('contact_requests');
    expect(mocks.update).toHaveBeenCalledWith({ status: 'cancelled' });
    expect(mocks.eq).toHaveBeenCalledWith('id', 'request-1');
    expect(mocks.eq).toHaveBeenCalledWith('guardian_id', 'guardian-1');
    expect(mocks.eq).toHaveBeenCalledWith('status', 'pending');
  });

  it('falha com contact_request_already_answered se nenhuma linha foi alterada', async () => {
    mockUpdate({ data: null, error: null });

    await expect(cancelContactRequest('guardian-1', 'request-1')).rejects.toThrow(
      'contact_request_already_answered',
    );
  });

  it('deixa o erro do Supabase subir', async () => {
    const error = { message: 'boom' };
    mockUpdate({ data: null, error });

    await expect(cancelContactRequest('guardian-1', 'request-1')).rejects.toBe(error);
  });
});