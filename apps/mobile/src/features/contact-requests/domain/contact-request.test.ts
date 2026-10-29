import {
  CONTACT_REQUEST_STATUSES,
  canAccept,
  canCancel,
  canDecline,
  canRequestAgain,
  isExpired,
  type ContactRequest,
  type ContactRequestStatus,
} from './contact-request';

const NOW = new Date('2026-10-28T12:00:00.000Z');
const FUTURE = new Date('2026-10-29T12:00:00.000Z');
const PAST = new Date('2026-10-27T12:00:00.000Z');

const GUARDIAN_ID = 'guardian-1';
const TEACHER_ID = 'teacher-1';
const OTHER_ID = 'other-1';

function makeRequest(overrides: Partial<ContactRequest> = {}): ContactRequest {
  return {
    id: 'request-1',
    guardianId: GUARDIAN_ID,
    teacherId: TEACHER_ID,
    status: 'pending',
    expiresAt: FUTURE,
    respondedAt: null,
    ...overrides,
  };
}

describe('estados da solicitação de contato', () => {
  it('modela os cinco estados do ciclo', () => {
    expect(CONTACT_REQUEST_STATUSES).toEqual([
      'pending',
      'accepted',
      'declined',
      'expired',
      'cancelled',
    ]);
  });
});

describe('isExpired', () => {
  it.each(CONTACT_REQUEST_STATUSES)(
    'só considera expirada uma solicitação pendente com prazo vencido (status %s)',
    (status) => {
      expect(isExpired(makeRequest({ status, expiresAt: PAST }), NOW)).toBe(status === 'pending');
    },
  );

  it('não expira uma solicitação pendente dentro do prazo', () => {
    expect(isExpired(makeRequest({ expiresAt: FUTURE }), NOW)).toBe(false);
  });

  it('expira no instante exato do prazo, como o banco', () => {
    expect(isExpired(makeRequest({ expiresAt: NOW }), NOW)).toBe(true);
  });

  it('usa o relógio atual quando nenhum instante é informado', () => {
    expect(isExpired(makeRequest({ expiresAt: new Date('2000-01-01T00:00:00.000Z') }))).toBe(true);
  });
});

describe('canAccept', () => {
  const allowedByStatus: Record<ContactRequestStatus, boolean> = {
    pending: true,
    accepted: false,
    declined: false,
    expired: false,
    cancelled: false,
  };

  it.each(CONTACT_REQUEST_STATUSES)('avalia o status %s', (status) => {
    expect(canAccept(makeRequest({ status }), TEACHER_ID, NOW)).toBe(allowedByStatus[status]);
  });

  it('impede o responsável de aceitar a própria solicitação', () => {
    expect(canAccept(makeRequest(), GUARDIAN_ID, NOW)).toBe(false);
  });

  it('impede outro professor de aceitar a solicitação', () => {
    expect(canAccept(makeRequest(), OTHER_ID, NOW)).toBe(false);
  });

  it('impede aceitar uma solicitação pendente com prazo vencido', () => {
    expect(canAccept(makeRequest({ expiresAt: PAST }), TEACHER_ID, NOW)).toBe(false);
  });

  it('impede aceitar no instante exato do prazo', () => {
    expect(canAccept(makeRequest({ expiresAt: NOW }), TEACHER_ID, NOW)).toBe(false);
  });

  it('usa o relógio atual quando nenhum instante é informado', () => {
    expect(
      canAccept(makeRequest({ expiresAt: new Date('2099-01-01T00:00:00.000Z') }), TEACHER_ID),
    ).toBe(true);
  });
});

describe('canDecline', () => {
  const allowedByStatus: Record<ContactRequestStatus, boolean> = {
    pending: true,
    accepted: false,
    declined: false,
    expired: false,
    cancelled: false,
  };

  it.each(CONTACT_REQUEST_STATUSES)('avalia o status %s', (status) => {
    expect(canDecline(makeRequest({ status }), TEACHER_ID, NOW)).toBe(allowedByStatus[status]);
  });

  it('impede o responsável de recusar a própria solicitação', () => {
    expect(canDecline(makeRequest(), GUARDIAN_ID, NOW)).toBe(false);
  });

  it('impede outro professor de recusar a solicitação', () => {
    expect(canDecline(makeRequest(), OTHER_ID, NOW)).toBe(false);
  });

  it('impede recusar uma solicitação pendente com prazo vencido', () => {
    expect(canDecline(makeRequest({ expiresAt: PAST }), TEACHER_ID, NOW)).toBe(false);
  });

  it('usa o relógio atual quando nenhum instante é informado', () => {
    expect(
      canDecline(makeRequest({ expiresAt: new Date('2099-01-01T00:00:00.000Z') }), TEACHER_ID),
    ).toBe(true);
  });
});

describe('canCancel', () => {
  const allowedByStatus: Record<ContactRequestStatus, boolean> = {
    pending: true,
    accepted: false,
    declined: false,
    expired: false,
    cancelled: false,
  };

  it.each(CONTACT_REQUEST_STATUSES)('avalia o status %s', (status) => {
    expect(canCancel(makeRequest({ status }), GUARDIAN_ID)).toBe(allowedByStatus[status]);
  });

  it('impede o professor de cancelar a solicitação', () => {
    expect(canCancel(makeRequest(), TEACHER_ID)).toBe(false);
  });

  it('impede outro responsável de cancelar a solicitação', () => {
    expect(canCancel(makeRequest(), OTHER_ID)).toBe(false);
  });

  it('permite cancelar enquanto o status ainda é pending, mesmo com o cron atrasado', () => {
    expect(canCancel(makeRequest({ expiresAt: PAST }), GUARDIAN_ID)).toBe(true);
  });
});

describe('canRequestAgain', () => {
  it('permite a primeira solicitação quando não há histórico', () => {
    expect(canRequestAgain([], GUARDIAN_ID, TEACHER_ID)).toBe(true);
  });

  it.each<ContactRequestStatus>(['declined', 'expired', 'cancelled'])(
    'permite pedir de novo depois do status %s',
    (status) => {
      expect(canRequestAgain([makeRequest({ status })], GUARDIAN_ID, TEACHER_ID)).toBe(true);
    },
  );

  it.each<ContactRequestStatus>(['pending', 'accepted'])(
    'impede uma segunda solicitação enquanto existe uma com status %s',
    (status) => {
      expect(canRequestAgain([makeRequest({ status })], GUARDIAN_ID, TEACHER_ID)).toBe(false);
    },
  );

  it('ignora solicitações abertas de outro professor', () => {
    const requests = [makeRequest({ teacherId: OTHER_ID, status: 'pending' })];

    expect(canRequestAgain(requests, GUARDIAN_ID, TEACHER_ID)).toBe(true);
  });

  it('ignora solicitações abertas de outro responsável', () => {
    const requests = [makeRequest({ guardianId: OTHER_ID, status: 'accepted' })];

    expect(canRequestAgain(requests, GUARDIAN_ID, TEACHER_ID)).toBe(true);
  });

  it('bloqueia se qualquer solicitação do par estiver aberta', () => {
    const requests = [
      makeRequest({ id: 'request-1', status: 'declined' }),
      makeRequest({ id: 'request-2', status: 'accepted' }),
    ];

    expect(canRequestAgain(requests, GUARDIAN_ID, TEACHER_ID)).toBe(false);
  });
});
