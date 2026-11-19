import { getReviewErrorMessage, REVIEW_NOT_ALLOWED_MESSAGE } from './errors';

describe('getReviewErrorMessage', () => {
  it('traduz a recusa do RLS (sem solicitação aceita)', () => {
    expect(
      getReviewErrorMessage({
        code: '42501',
        message: 'new row violates row-level security policy for table "reviews"',
      }),
    ).toBe(REVIEW_NOT_ALLOWED_MESSAGE);
  });

  it('traduz a avaliação repetida do mesmo par', () => {
    expect(getReviewErrorMessage({ code: '23505', message: 'duplicate key' })).toMatch(
      /já avaliou/,
    );
  });

  it('traduz o check da tabela', () => {
    expect(getReviewErrorMessage({ code: '23514', message: 'check' })).toMatch(/1 a 5/);
  });

  it('traduz a avaliação que não existe mais', () => {
    expect(getReviewErrorMessage(new Error('review_not_found'))).toMatch(/Não encontramos/);
  });

  it('cai na mensagem genérica para o resto', () => {
    expect(getReviewErrorMessage(new Error('Network request failed'))).toMatch(
      /Verifique sua conexão/,
    );
    expect(getReviewErrorMessage(null)).toMatch(/Verifique sua conexão/);
  });
});
