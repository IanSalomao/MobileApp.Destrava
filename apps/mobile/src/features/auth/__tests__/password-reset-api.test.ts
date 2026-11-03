import { requestPasswordReset } from '../api';
import { PASSWORD_RESET_REDIRECT_URL } from '../password-reset';

const mockResetPasswordForEmail = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: (...args: unknown[]) => mockResetPasswordForEmail(...args),
    },
  },
}));

describe('AUT-04: requestPasswordReset (integração com supabase.auth.resetPasswordForEmail)', () => {
  afterEach(() => jest.clearAllMocks());

  it('pede o e-mail de redefinição com o link de volta ao app', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    await requestPasswordReset({ email: 'pai@destrava.com' });

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith('pai@destrava.com', {
      redirectTo: PASSWORD_RESET_REDIRECT_URL,
    });
  });

  it('repassa o erro do Supabase (ex.: limite de pedidos) para a tela tratar', async () => {
    const rateLimit = Object.assign(new Error('rate limit'), {
      code: 'over_email_send_rate_limit',
    });
    mockResetPasswordForEmail.mockResolvedValue({ data: null, error: rateLimit });

    await expect(requestPasswordReset({ email: 'pai@destrava.com' })).rejects.toBe(rateLimit);
  });
});
