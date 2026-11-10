import { supabase } from '@/lib/supabase';

import { getTeacherDashboard, listReceivedContactRequests } from './api';

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const mockFrom = supabase.from as jest.Mock;

const TEACHER_ID = 'teacher-1';

function requestsBuilder(data: unknown, error: unknown = null) {
  const order = jest.fn().mockResolvedValue({ data, error });
  const eq = jest.fn().mockReturnValue({ order });
  const select = jest.fn().mockReturnValue({ eq });
  return { select, eq, order };
}

function teacherBuilder(data: unknown, error: unknown = null) {
  const single = jest.fn().mockResolvedValue({ data, error });
  const eq = jest.fn().mockReturnValue({ single });
  const select = jest.fn().mockReturnValue({ eq });
  return { select, eq, single };
}

function profilesBuilder(data: unknown, error: unknown = null) {
  const inFn = jest.fn().mockResolvedValue({ data, error });
  const select = jest.fn().mockReturnValue({ in: inFn });
  return { select, in: inFn };
}

type MockRow = {
  id: string;
  status: string;
  guardian_id: string;
  guardian_name: string;
  student_id: string | null;
  student_name: string;
  student_school_grade: string;
  created_at: string;
  responded_at: string | null;
  expires_at: string;
};

const ROWS: MockRow[] = [
  {
    id: 'r4-expired',
    status: 'pending',
    guardian_id: 'g4',
    guardian_name: 'Renata Souza',
    student_id: 's4',
    student_name: 'Lívia Souza',
    student_school_grade: 'high_school_1',
    created_at: '2026-11-09T10:00:00.000Z',
    responded_at: null,
    expires_at: '2026-11-09T11:00:00.000Z',
  },
  {
    id: 'r3-valid',
    status: 'pending',
    guardian_id: 'g3',
    guardian_name: 'Roberto Nascimento',
    student_id: 's3',
    student_name: 'Pedro Nascimento',
    student_school_grade: 'elementary_9',
    created_at: '2026-11-08T10:00:00.000Z',
    responded_at: null,
    expires_at: '2099-01-01T00:00:00.000Z',
  },
  {
    id: 'r2-accepted',
    status: 'accepted',
    guardian_id: 'g2',
    guardian_name: 'Carlos Eduardo Silva',
    student_id: 's1',
    student_name: 'Lucas Silva',
    student_school_grade: 'elementary_5',
    created_at: '2026-11-02T10:00:00.000Z',
    responded_at: '2026-11-02T13:00:00.000Z',
    expires_at: '2026-11-03T10:00:00.000Z',
  },
  {
    id: 'r1-accepted',
    status: 'accepted',
    guardian_id: 'g1',
    guardian_name: 'Juliana Martins',
    student_id: 's1',
    student_name: 'Gabriel Martins',
    student_school_grade: 'elementary_7',
    created_at: '2026-11-01T10:00:00.000Z',
    responded_at: '2026-11-01T12:00:00.000Z',
    expires_at: '2026-11-02T10:00:00.000Z',
  },
  {
    id: 'r5-declined',
    status: 'declined',
    guardian_id: 'g5',
    guardian_name: 'Fernanda Costa',
    student_id: 's5',
    student_name: 'Sofia Costa',
    student_school_grade: 'high_school_2',
    created_at: '2026-10-30T10:00:00.000Z',
    responded_at: '2026-10-30T11:00:00.000Z',
    expires_at: '2026-10-31T10:00:00.000Z',
  },
];

const PROFILES = [
  { id: 'g1', full_name: 'Juliana Martins', avatar_url: 'https://cdn.destrava.com/juliana.jpg' },
];

const TEACHER = { is_published: true, rating_average: 4.9, rating_count: 18 };

function mockDashboard(requests = ROWS, teacher = TEACHER) {
  const requestsMock = requestsBuilder(requests);
  const teacherMock = teacherBuilder(teacher);
  const profilesMock = profilesBuilder(PROFILES);

  mockFrom.mockImplementation((table: string) => {
    if (table === 'contact_requests') return requestsMock;
    if (table === 'teachers') return teacherMock;
    if (table === 'profiles') return profilesMock;
    throw new Error(`tabela inesperada: ${table}`);
  });

  return { requestsMock, teacherMock, profilesMock };
}

describe('getTeacherDashboard', () => {
  afterEach(() => jest.clearAllMocks());

  it('monta os números e as listas recentes do professor', async () => {
    const { requestsMock, teacherMock, profilesMock } = mockDashboard();

    const dashboard = await getTeacherDashboard(TEACHER_ID);

    expect(mockFrom).toHaveBeenCalledWith('contact_requests');
    expect(requestsMock.eq).toHaveBeenCalledWith('teacher_id', TEACHER_ID);
    expect(requestsMock.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(teacherMock.eq).toHaveBeenCalledWith('id', TEACHER_ID);
    expect(profilesMock.in).toHaveBeenCalledWith('id', ['g4', 'g3', 'g2', 'g1', 'g5']);

    expect(dashboard.isPublished).toBe(true);
    expect(dashboard.ratingAverage).toBe(4.9);
    expect(dashboard.ratingCount).toBe(18);
    expect(dashboard.clientsCount).toBe(4);
    expect(dashboard.conversationsCount).toBe(2);

    expect(dashboard.recentContacts.map((contact) => contact.id)).toEqual([
      'r2-accepted',
      'r1-accepted',
    ]);
    expect(dashboard.recentContacts[1]).toMatchObject({
      guardianName: 'Juliana Martins',
      guardianAvatarUrl: 'https://cdn.destrava.com/juliana.jpg',
      studentName: 'Gabriel Martins',
    });
  });

  it('descarta pendentes expiradas e mantém a ordem de criação nas solicitações', async () => {
    mockDashboard();

    const dashboard = await getTeacherDashboard(TEACHER_ID);

    expect(dashboard.recentRequests.map((request) => request.id)).toEqual(['r3-valid']);
    expect(dashboard.recentRequests[0]?.schoolGrade).toBe('elementary_9');
  });

  it('usa o nome enviado no formulário quando o perfil do responsável não vem', async () => {
    mockDashboard();

    const dashboard = await getTeacherDashboard(TEACHER_ID);

    expect(dashboard.recentContacts[0]).toMatchObject({
      guardianName: 'Carlos Eduardo Silva',
      guardianAvatarUrl: null,
    });
  });

  it('trata aluno sem cadastro e contato aceito sem data de resposta', async () => {
    mockDashboard([
      {
        id: 'sem-aluno',
        status: 'accepted',
        guardian_id: 'g1',
        guardian_name: 'Juliana Martins',
        student_id: null,
        student_name: 'Aluno Convidado',
        student_school_grade: 'elementary_3',
        created_at: '2026-11-01T10:00:00.000Z',
        responded_at: null,
        expires_at: '2026-11-02T10:00:00.000Z',
      },
      {
        id: 'com-aluno',
        status: 'accepted',
        guardian_id: 'g1',
        guardian_name: 'Juliana Martins',
        student_id: 's2',
        student_name: 'Gabriel Martins',
        student_school_grade: 'elementary_7',
        created_at: '2026-11-02T10:00:00.000Z',
        responded_at: '2026-11-02T12:00:00.000Z',
        expires_at: '2026-11-03T10:00:00.000Z',
      },
    ]);

    const dashboard = await getTeacherDashboard(TEACHER_ID);

    expect(dashboard.clientsCount).toBe(2);
    expect(dashboard.recentContacts.map((contact) => contact.id)).toEqual([
      'com-aluno',
      'sem-aluno',
    ]);
  });

  it('devolve o painel vazio quando o professor ainda não recebeu solicitações', async () => {
    const requestsMock = requestsBuilder([]);
    const teacherMock = teacherBuilder({
      is_published: false,
      rating_average: null,
      rating_count: 0,
    });
    mockFrom.mockImplementation((table: string) =>
      table === 'contact_requests' ? requestsMock : teacherMock,
    );

    const dashboard = await getTeacherDashboard(TEACHER_ID);

    expect(mockFrom).not.toHaveBeenCalledWith('profiles');
    expect(dashboard).toMatchObject({
      isPublished: false,
      ratingAverage: null,
      ratingCount: 0,
      clientsCount: 0,
      conversationsCount: 0,
      recentContacts: [],
      recentRequests: [],
    });
  });

  it('propaga o erro da consulta de solicitações', async () => {
    const error = new Error('falha em contact_requests');
    const requestsMock = requestsBuilder(null, error);
    const teacherMock = teacherBuilder(TEACHER);
    mockFrom.mockImplementation((table: string) =>
      table === 'contact_requests' ? requestsMock : teacherMock,
    );

    await expect(getTeacherDashboard(TEACHER_ID)).rejects.toBe(error);
  });

  it('propaga o erro da consulta do professor', async () => {
    const error = new Error('falha em teachers');
    const requestsMock = requestsBuilder(ROWS);
    const teacherMock = teacherBuilder(null, error);
    mockFrom.mockImplementation((table: string) =>
      table === 'contact_requests' ? requestsMock : teacherMock,
    );

    await expect(getTeacherDashboard(TEACHER_ID)).rejects.toBe(error);
  });

  it('propaga o erro da consulta dos perfis dos responsáveis', async () => {
    const error = new Error('falha em profiles');
    const requestsMock = requestsBuilder(ROWS);
    const teacherMock = teacherBuilder(TEACHER);
    const profilesMock = profilesBuilder(null, error);
    mockFrom.mockImplementation((table: string) => {
      if (table === 'contact_requests') return requestsMock;
      if (table === 'teachers') return teacherMock;
      return profilesMock;
    });

    await expect(getTeacherDashboard(TEACHER_ID)).rejects.toBe(error);
  });
});

type ReceivedMockRow = MockRow & {
  reason: string;
  preferred_tutoring_type: string | null;
};

const RECEIVED_ROWS: ReceivedMockRow[] = [
  {
    ...ROWS[3],
    reason: 'Precisamos de reforço em Matemática às terças e quintas à tarde.',
    preferred_tutoring_type: 'in_person',
  },
  {
    ...ROWS[2],
    reason: 'O Lucas precisa de acompanhamento nas tarefas de casa de matemática.',
    preferred_tutoring_type: 'online',
  },
  {
    ...ROWS[0],
    reason: 'A Lívia precisa de ajuda em cinemática e funções.',
    preferred_tutoring_type: 'online',
  },
];

function mockReceived(
  rows: ReceivedMockRow[] = RECEIVED_ROWS,
  profiles: unknown = PROFILES,
  profilesError: unknown = null,
) {
  const requestsMock = requestsBuilder(rows);
  const profilesMock = profilesBuilder(profiles, profilesError);

  mockFrom.mockImplementation((table: string) => {
    if (table === 'contact_requests') return requestsMock;
    if (table === 'profiles') return profilesMock;
    throw new Error(`tabela inesperada: ${table}`);
  });

  return { requestsMock, profilesMock };
}

describe('listReceivedContactRequests', () => {
  afterEach(() => jest.clearAllMocks());

  it('mapeia os pedidos com responsável, aluno, motivo e modalidade', async () => {
    const { requestsMock, profilesMock } = mockReceived();

    const requests = await listReceivedContactRequests(TEACHER_ID);

    expect(mockFrom).toHaveBeenCalledWith('contact_requests');
    expect(requestsMock.eq).toHaveBeenCalledWith('teacher_id', TEACHER_ID);
    expect(requestsMock.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(profilesMock.in).toHaveBeenCalledWith('id', ['g1', 'g2', 'g4']);

    expect(requests).toHaveLength(3);
    expect(requests[0]).toMatchObject({
      id: 'r1-accepted',
      status: 'accepted',
      guardianName: 'Juliana Martins',
      guardianAvatarUrl: 'https://cdn.destrava.com/juliana.jpg',
      studentName: 'Gabriel Martins',
      schoolGrade: 'elementary_7',
      reason: 'Precisamos de reforço em Matemática às terças e quintas à tarde.',
      preferredTutoringType: 'in_person',
    });
    expect(requests[0].createdAt).toBeInstanceOf(Date);
    expect(requests[0].respondedAt).toBeInstanceOf(Date);
    expect(requests[0].expiresAt).toBeInstanceOf(Date);
  });

  it('usa o nome e o avatar do formulário quando o perfil do responsável não vem', async () => {
    mockReceived(RECEIVED_ROWS, []);

    const requests = await listReceivedContactRequests(TEACHER_ID);

    expect(requests[1]).toMatchObject({
      guardianName: 'Carlos Eduardo Silva',
      guardianAvatarUrl: null,
    });
  });

  it('não busca perfis quando não há pedidos e devolve lista vazia', async () => {
    mockReceived([]);

    const requests = await listReceivedContactRequests(TEACHER_ID);

    expect(requests).toEqual([]);
    expect(mockFrom).not.toHaveBeenCalledWith('profiles');
  });

  it('propaga o erro da consulta de pedidos', async () => {
    const error = new Error('falha em contact_requests');
    const requestsMock = requestsBuilder(null, error);
    mockFrom.mockImplementation((table: string) => {
      if (table === 'contact_requests') return requestsMock;
      throw new Error(`tabela inesperada: ${table}`);
    });

    await expect(listReceivedContactRequests(TEACHER_ID)).rejects.toBe(error);
  });

  it('propaga o erro da consulta dos perfis', async () => {
    const error = new Error('falha em profiles');
    const requestsMock = requestsBuilder(RECEIVED_ROWS);
    const profilesMock = profilesBuilder(null, error);
    mockFrom.mockImplementation((table: string) => {
      if (table === 'contact_requests') return requestsMock;
      if (table === 'profiles') return profilesMock;
      throw new Error(`tabela inesperada: ${table}`);
    });

    await expect(listReceivedContactRequests(TEACHER_ID)).rejects.toBe(error);
  });
});
