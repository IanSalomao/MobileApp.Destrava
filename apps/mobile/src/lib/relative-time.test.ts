import { formatRelativeTime } from './relative-time';

const NOW = new Date(2026, 10, 9, 12, 0, 0);

function minutesAgo(minutes: number): Date {
  return new Date(NOW.getTime() - minutes * 60 * 1000);
}

describe('formatRelativeTime', () => {
  it('mostra "Agora" para menos de um minuto ou data futura', () => {
    expect(formatRelativeTime(minutesAgo(0), NOW)).toBe('Agora');
    expect(formatRelativeTime(minutesAgo(-5), NOW)).toBe('Agora');
  });

  it('mostra os minutos', () => {
    expect(formatRelativeTime(minutesAgo(12), NOW)).toBe('Há 12 min');
    expect(formatRelativeTime(minutesAgo(59), NOW)).toBe('Há 59 min');
  });

  it('mostra as horas', () => {
    expect(formatRelativeTime(minutesAgo(60), NOW)).toBe('Há 1 h');
    expect(formatRelativeTime(minutesAgo(5 * 60), NOW)).toBe('Há 5 h');
  });

  it('mostra "Ontem" entre 24 e 48 horas', () => {
    expect(formatRelativeTime(minutesAgo(24 * 60), NOW)).toBe('Ontem');
  });

  it('mostra os dias até uma semana', () => {
    expect(formatRelativeTime(minutesAgo(3 * 24 * 60), NOW)).toBe('Há 3 dias');
  });

  it('mostra a data completa depois de uma semana', () => {
    expect(formatRelativeTime(new Date(2026, 9, 26, 12, 0, 0), NOW)).toBe('26/10/2026');
  });
});
