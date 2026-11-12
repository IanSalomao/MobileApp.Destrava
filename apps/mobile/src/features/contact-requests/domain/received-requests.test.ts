import { groupReceivedRequest } from './received-requests';

const NOW = new Date(2026, 10, 9, 12, 0, 0);

function at(minutesFromNow: number): Date {
  return new Date(NOW.getTime() + minutesFromNow * 60 * 1000);
}

describe('groupReceivedRequest', () => {
  it('agrupa aceitos e recusados pelo status', () => {
    expect(groupReceivedRequest({ status: 'accepted', expiresAt: at(-1) }, NOW)).toBe('accepted');
    expect(groupReceivedRequest({ status: 'declined', expiresAt: at(-1) }, NOW)).toBe('declined');
  });

  it('agrupa expirados e cancelados como expirados', () => {
    expect(groupReceivedRequest({ status: 'expired', expiresAt: at(-1) }, NOW)).toBe('expired');
    expect(groupReceivedRequest({ status: 'cancelled', expiresAt: at(-1) }, NOW)).toBe('expired');
  });

  it('mantém pendente enquanto o prazo não venceu', () => {
    expect(groupReceivedRequest({ status: 'pending', expiresAt: at(1) }, NOW)).toBe('pending');
  });

  it('trata pendente com prazo vencido como expirado', () => {
    expect(groupReceivedRequest({ status: 'pending', expiresAt: at(-1) }, NOW)).toBe('expired');
    expect(groupReceivedRequest({ status: 'pending', expiresAt: at(0) }, NOW)).toBe('expired');
  });
});
