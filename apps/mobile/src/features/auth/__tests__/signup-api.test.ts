import { signUp } from '../api';
import { TERMS_VERSION } from '../consent';

const mockSignUp = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { signUp: (...args: unknown[]) => mockSignUp(...args) } },
}));

describe('AUT-09: signUp envia o aceite ao Supabase', () => {
  beforeEach(() =>
    mockSignUp.mockResolvedValue({ data: { user: null, session: null }, error: null }),
  );
  afterEach(() => jest.clearAllMocks());

  it('inclui versão do termo, aceite e celular nos metadados do cadastro', async () => {
    await signUp({
      fullName: 'Ana',
      email: 'ana@destrava.com',
      phone: '11999991234',
      password: 'senha-segura-1',
      role: 'teacher',
      termsAccepted: true,
      minorDataConsent: false,
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'ana@destrava.com',
      password: 'senha-segura-1',
      options: {
        data: {
          full_name: 'Ana',
          role: 'teacher',
          terms_accepted: true,
          terms_version: TERMS_VERSION,
          phone: '+5511999991234',
        },
      },
    });
  });
});
