import type { AuthRepository } from '../api';
import type { ForgotPasswordInput, SignInInput } from '../schemas';

export class FakeAuthRepository implements AuthRepository {
  public calls: SignInInput[] = [];
  public passwordResetRequests: ForgotPasswordInput[] = [];
  public shouldFailWithNetworkError = false;
  // Segura as respostas até o teste chamar releaseResponses(), para observar o
  // estado de carregamento sem depender de uma janela de tempo.
  public holdResponses = false;
  private heldResponses: (() => void)[] = [];

  private validUsers = new Map<string, { password: string; role: 'guardian' | 'teacher' }>([
    ['pai@destrava.com', { password: 'password123', role: 'guardian' }],
    ['prof@destrava.com', { password: 'password123', role: 'teacher' }],
  ]);

  async signIn(credentials: SignInInput) {
    this.calls.push(credentials);

    await this.waitForRelease();

    if (this.shouldFailWithNetworkError) {
      throw new Error('Network error');
    }

    const account = this.validUsers.get(credentials.email);
    if (!account || account.password !== credentials.password) {
      const invalidCredentialsError = new Error('Invalid login credentials') as Error & {
        code: string;
      };
      invalidCredentialsError.name = 'InvalidCredentialsError';
      invalidCredentialsError.code = 'invalid_credentials';
      throw invalidCredentialsError;
    }

    return {
      user: {
        id: `user-${account.role}`,
        email: credentials.email,
        user_metadata: { role: account.role },
      },
      session: {
        access_token: 'fake-access-token',
      },
    };
  }

  releaseResponses() {
    this.heldResponses.splice(0).forEach((release) => release());
  }

  private async waitForRelease() {
    if (!this.holdResponses) return;
    await new Promise<void>((resolve) => this.heldResponses.push(resolve));
  }

  // Como o Supabase: o pedido é aceito para qualquer e-mail, cadastrado ou não.
  async requestPasswordReset(input: ForgotPasswordInput) {
    this.passwordResetRequests.push(input);

    await this.waitForRelease();

    if (this.shouldFailWithNetworkError) {
      throw new Error('Network error');
    }
  }
}
