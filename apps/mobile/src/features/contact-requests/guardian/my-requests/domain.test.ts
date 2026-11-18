import {
  buildTeacherWhatsAppUrl,
  canAskAgain,
  canCancelMyRequest,
  countPending,
  filterMyRequests,
  formatSentAt,
  getDisplayStatus,
} from './domain';
import type { MyContactRequest } from './types';

const NOW = new Date('2026-11-17T12:00:00.000Z');
const IN_TIME = new Date('2026-11-18T10:00:00.000Z');
const OVERDUE = new Date('2026-11-17T09:00:00.000Z');

function makeRequest(overrides: Partial<MyContactRequest> = {}): MyContactRequest {
  return {
    id: 'request-1',
    status: 'pending',
    guardianId: 'guardian-1',
    teacherId: 'teacher-1',
    teacherName: 'Mariana Alves',
    teacherAvatarUrl: null,
    teacherPhone: null,
    studentName: 'Lucas Martins',
    studentAge: 12,
    schoolGrade: 'elementary_7',
    reason: 'Reforço em frações.',
    preferredTutoringType: 'online',
    createdAt: new Date('2026-11-17T10:00:00.000Z'),
    respondedAt: null,
    expiresAt: IN_TIME,
    ...overrides,
  };
}

describe('getDisplayStatus', () => {
  it('pendente dentro do prazo continua pendente', () => {
    expect(getDisplayStatus(makeRequest(), NOW)).toBe('pending');
  });

  it('pendente com o prazo vencido aparece como expirada', () => {
    expect(getDisplayStatus(makeRequest({ expiresAt: OVERDUE }), NOW)).toBe('expired');
  });

  it.each(['accepted', 'declined', 'expired', 'cancelled'] as const)(
    'mantém o status %s, mesmo com o prazo vencido',
    (status) => {
      expect(getDisplayStatus(makeRequest({ status, expiresAt: OVERDUE }), NOW)).toBe(status);
    },
  );
});

describe('filterMyRequests', () => {
  const pending = makeRequest({ id: 'pending' });
  const overdue = makeRequest({ id: 'overdue', expiresAt: OVERDUE });
  const accepted = makeRequest({ id: 'accepted', status: 'accepted' });
  const declined = makeRequest({ id: 'declined', status: 'declined' });
  const expired = makeRequest({ id: 'expired', status: 'expired' });
  const cancelled = makeRequest({ id: 'cancelled', status: 'cancelled' });
  const all = [pending, overdue, accepted, declined, expired, cancelled];

  const ids = (filter: Parameters<typeof filterMyRequests>[1]) =>
    filterMyRequests(all, filter, NOW).map((request) => request.id);

  it('"todas" devolve tudo', () => {
    expect(ids('all')).toEqual([
      'pending',
      'overdue',
      'accepted',
      'declined',
      'expired',
      'cancelled',
    ]);
  });

  it('"pendentes" ignora as que já passaram do prazo', () => {
    expect(ids('pending')).toEqual(['pending']);
  });

  it('"expiradas" junta expirada, cancelada e pendente vencida', () => {
    expect(ids('expired')).toEqual(['overdue', 'expired', 'cancelled']);
  });

  it('"aceitas" e "recusadas" filtram pelo próprio status', () => {
    expect(ids('accepted')).toEqual(['accepted']);
    expect(ids('declined')).toEqual(['declined']);
  });
});

describe('countPending', () => {
  it('conta só as pendentes dentro do prazo', () => {
    const requests = [
      makeRequest(),
      makeRequest({ id: 'overdue', expiresAt: OVERDUE }),
      makeRequest({ id: 'accepted', status: 'accepted' }),
    ];

    expect(countPending(requests, NOW)).toBe(1);
  });
});

describe('canCancelMyRequest', () => {
  it('cancela enquanto está pendente e no prazo', () => {
    expect(canCancelMyRequest(makeRequest(), NOW)).toBe(true);
  });

  it('não cancela depois do prazo nem de uma solicitação respondida', () => {
    expect(canCancelMyRequest(makeRequest({ expiresAt: OVERDUE }), NOW)).toBe(false);
    expect(canCancelMyRequest(makeRequest({ status: 'accepted' }), NOW)).toBe(false);
  });
});

describe('canAskAgain', () => {
  it('libera depois de recusada, expirada ou cancelada', () => {
    for (const status of ['declined', 'expired', 'cancelled'] as const) {
      const request = makeRequest({ status });
      expect(canAskAgain(request, [request])).toBe(true);
    }
  });

  it('não libera enquanto está pendente ou aceita', () => {
    for (const status of ['pending', 'accepted'] as const) {
      const request = makeRequest({ status });
      expect(canAskAgain(request, [request])).toBe(false);
    }
  });

  it('não libera se já há outra solicitação aberta para o mesmo professor', () => {
    const declined = makeRequest({ status: 'declined' });
    const open = makeRequest({ id: 'request-2', status: 'pending' });

    expect(canAskAgain(declined, [declined, open])).toBe(false);
  });

  it('solicitação aberta com outro professor não atrapalha', () => {
    const declined = makeRequest({ status: 'declined' });
    const other = makeRequest({ id: 'request-2', teacherId: 'teacher-2' });

    expect(canAskAgain(declined, [declined, other])).toBe(true);
  });
});

describe('formatSentAt', () => {
  it('diz há quanto tempo o pedido foi enviado', () => {
    expect(formatSentAt(new Date('2026-11-17T10:00:00.000Z'), NOW)).toBe('Pedido enviado há 2 h');
  });

  it('usa "agora" para pedidos de menos de um minuto', () => {
    expect(formatSentAt(NOW, NOW)).toBe('Pedido enviado agora');
  });
});

describe('buildTeacherWhatsAppUrl', () => {
  const accepted = makeRequest({ status: 'accepted', teacherPhone: '+5511999991234' });

  function decodedMessage(url: string | null): string {
    return decodeURIComponent((url ?? '').split('?text=')[1] ?? '');
  }

  it('sem número liberado não há link', () => {
    expect(buildTeacherWhatsAppUrl(makeRequest(), 'Juliana Martins')).toBeNull();
  });

  it('monta o link do wa.me com a mensagem pronta', () => {
    const url = buildTeacherWhatsAppUrl(accepted, 'Juliana Martins');

    expect(url).toContain('https://wa.me/5511999991234?text=');
    expect(decodedMessage(url)).toContain('Olá, Mariana Alves! Aqui é Juliana Martins');
    expect(decodedMessage(url)).toContain('responsável por Lucas Martins');
  });

  it('sem o nome do responsável, a mensagem continua natural', () => {
    expect(decodedMessage(buildTeacherWhatsAppUrl(accepted, null))).toContain(
      'Sou responsável por Lucas Martins.',
    );
  });
});