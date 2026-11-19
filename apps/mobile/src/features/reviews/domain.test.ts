import {
  getFirstName,
  getPageRange,
  getRatingLabel,
  normalizeComment,
  REVIEWS_PAGE_SIZE,
  toReview,
} from './domain';

describe('normalizeComment', () => {
  it('tira os espaços das pontas', () => {
    expect(normalizeComment('  Ótima professora!  ')).toBe('Ótima professora!');
  });

  it('comentário vazio ou em branco vira null', () => {
    expect(normalizeComment('')).toBeNull();
    expect(normalizeComment('   ')).toBeNull();
    expect(normalizeComment(null)).toBeNull();
    expect(normalizeComment(undefined)).toBeNull();
  });
});

describe('getFirstName', () => {
  it('usa o primeiro nome', () => {
    expect(getFirstName('Ana Paula Souza')).toBe('Ana');
    expect(getFirstName('  Bruno  ')).toBe('Bruno');
  });

  it('sem nome, cai em "o professor"', () => {
    expect(getFirstName('   ')).toBe('o professor');
  });
});

describe('getRatingLabel', () => {
  it('dá um rótulo para cada nota de 1 a 5', () => {
    expect(getRatingLabel(1)).toBe('Ruim');
    expect(getRatingLabel(5)).toBe('Excelente');
  });

  it('sem nota escolhida (0), não há rótulo', () => {
    expect(getRatingLabel(0)).toBeNull();
  });
});

describe('getPageRange', () => {
  it('pede uma linha a mais que a página para saber se há próxima', () => {
    expect(getPageRange(0)).toEqual({ page: 0, from: 0, to: REVIEWS_PAGE_SIZE });
    expect(getPageRange(2, 5)).toEqual({ page: 2, from: 10, to: 15 });
  });

  it('página inválida volta para a primeira', () => {
    expect(getPageRange(-1, 5)).toEqual({ page: 0, from: 0, to: 5 });
    expect(getPageRange(1.5, 5)).toEqual({ page: 0, from: 0, to: 5 });
  });
});

describe('toReview', () => {
  it('converte a linha do banco para o modelo da tela', () => {
    expect(
      toReview({
        id: 'r1',
        teacher_id: 't1',
        rating: 4,
        comment: null,
        reviewer_name: 'Camila S.',
        created_at: '2026-11-10T12:00:00Z',
        updated_at: '2026-11-11T12:00:00Z',
      }),
    ).toEqual({
      id: 'r1',
      teacherId: 't1',
      rating: 4,
      comment: null,
      reviewerName: 'Camila S.',
      createdAt: '2026-11-10T12:00:00Z',
      updatedAt: '2026-11-11T12:00:00Z',
    });
  });
});
