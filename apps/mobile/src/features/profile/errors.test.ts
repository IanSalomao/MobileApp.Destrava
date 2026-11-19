import { getProfileErrorMessage } from './errors';

describe('getProfileErrorMessage', () => {
  it('traduz o check do banco', () => {
    expect(getProfileErrorMessage({ code: '23514', message: 'check' })).toMatch(/120 caracteres/);
  });

  it('traduz a foto grande demais (status numérico ou texto)', () => {
    expect(getProfileErrorMessage({ status: 413, message: 'Payload too large' })).toMatch(/5 MB/);
    expect(getProfileErrorMessage({ statusCode: '413', message: 'too large' })).toMatch(/5 MB/);
  });

  it('traduz o formato de imagem não aceito', () => {
    expect(getProfileErrorMessage({ statusCode: '415', message: 'mime type' })).toMatch(
      /JPG ou PNG/,
    );
  });

  it('traduz sessão expirada e celular inválido', () => {
    expect(getProfileErrorMessage(new Error('not_authenticated'))).toMatch(/sessão expirou/);
    expect(getProfileErrorMessage(new Error('invalid_phone'))).toMatch(/celular válido/);
  });

  it('cai na mensagem genérica para o resto', () => {
    expect(getProfileErrorMessage(new Error('Network request failed'))).toMatch(
      /Verifique sua conexão/,
    );
    expect(getProfileErrorMessage('falha')).toMatch(/Verifique sua conexão/);
  });
});
