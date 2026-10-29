import type { AuthRepository } from '../api';
import type { SignInInput } from '../schemas';

export class FakeAuthRepository implements AuthRepository {
  public calls: SignInInput[] = [];
  public shouldFailWithNetworkError = false;
  public delayMs = 0;

  private validUsers = new Map<string, { password: string; role: 'guardian' | 'teacher' }>([
    ['pai@destrava.com', { password: 'password123', role: 'guardian' }],
    ['prof@destrava.com', { password: 'password123', role: 'teacher' }],
  ]);

  async signIn(credentials: SignInInput) {
    this.calls.push(credentials);

    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

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
}
