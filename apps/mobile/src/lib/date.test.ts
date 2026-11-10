import { formatDateTime } from './date';

describe('formatDateTime', () => {
  it('formata dia, mês, ano, hora e minuto com zero à esquerda', () => {
    expect(formatDateTime(new Date(2026, 10, 9, 8, 5))).toBe('09/11/2026 às 08:05');
  });

  it('mantém a hora no formato 24h', () => {
    expect(formatDateTime(new Date(2026, 0, 1, 18, 30))).toBe('01/01/2026 às 18:30');
  });
});
