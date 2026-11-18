import { getCreateContactRequestErrorMessage } from './errors';

describe('getCreateContactRequestErrorMessage', () => {
  it('explica que já existe uma solicitação em aberto com o professor', () => {
    expect(getCreateContactRequestErrorMessage({ code: '23505', message: 'duplicate' })).toContain(
      'solicitação em aberto',
    );
  });

  it('explica que o professor não está disponível (RLS)', () => {
    expect(getCreateContactRequestErrorMessage({ code: '42501', message: 'rls' })).toBe(
      'Este professor não está disponível para novas solicitações no momento.',
    );
  });

  it('usa a mensagem genérica para qualquer outro erro', () => {
    const expected = 'Não foi possível concluir agora. Verifique sua conexão e tente de novo.';

    expect(getCreateContactRequestErrorMessage(new Error('Network request failed'))).toBe(expected);
    expect(getCreateContactRequestErrorMessage(null)).toBe(expected);
  });
});