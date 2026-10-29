import { getAuthErrorMessage, INVALID_CREDENTIALS_MESSAGE } from '../errors';
import { signInSchema } from '../schemas';

describe('AUT-02 Domain: signInSchema (Zod) & getAuthErrorMessage', () => {
  it('valida e normaliza e-mail (trim + lowercase) e senha válidos', () => {
    const result = signInSchema.safeParse({
      email: '  Bia@Destrava.com ',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        email: 'bia@destrava.com',
        password: 'password123',
      });
    }
  });

  it('rejeita formato de e-mail inválido antes de chamar a rede', () => {
    const result = signInSchema.safeParse({
      email: 'email-invalido',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain('Informe um e-mail válido.');
    }
  });

  it('rejeita senha vazia', () => {
    const result = signInSchema.safeParse({
      email: 'bia@destrava.com',
      password: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain('Informe a senha.');
    }
  });

  it('retorna mensagem genérica "E-mail ou senha inválidos" sem revelar qual campo errou', () => {
    const error = { code: 'invalid_credentials' };
    expect(getAuthErrorMessage(error)).toBe(INVALID_CREDENTIALS_MESSAGE);
    expect(getAuthErrorMessage(error)).toBe('E-mail ou senha inválidos');
  });
});
