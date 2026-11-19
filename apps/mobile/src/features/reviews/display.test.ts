import { formatAverage, formatReviewCount, formatReviewDate, formatStars } from './domain';

describe('exibição das avaliações', () => {
  it('formatStars desenha a nota em estrelas, arredondando e limitando', () => {
    expect(formatStars(4)).toBe('★★★★☆');
    expect(formatStars(4.6)).toBe('★★★★★');
    expect(formatStars(0)).toBe('☆☆☆☆☆');
    expect(formatStars(9)).toBe('★★★★★');
  });

  it('formatAverage usa vírgula e traço sem avaliações', () => {
    expect(formatAverage(4.86)).toBe('4,9');
    expect(formatAverage(null)).toBe('—');
  });

  it('formatReviewCount concorda com o número', () => {
    expect(formatReviewCount(1)).toBe('1 avaliação');
    expect(formatReviewCount(0)).toBe('0 avaliações');
    expect(formatReviewCount(12)).toBe('12 avaliações');
  });

  it('formatReviewDate mostra dia, mês abreviado e ano', () => {
    expect(formatReviewDate('2026-11-18T15:00:00Z')).toMatch(/18.*nov.*2026/);
  });
});
