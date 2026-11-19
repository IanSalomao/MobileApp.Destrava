import * as WebBrowser from 'expo-web-browser';

import { completeRoleChoice, signInWithGoogle } from '../api';
import { TERMS_VERSION } from '../consent';
import { getAuthErrorMessage } from '../errors';

const mockSignInWithOAuth = jest.fn();
const mockSetSession = jest.fn();
const mockExchange = jest.fn();
const mockRpc = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      setSession: (...args: unknown[]) => mockSetSession(...args),
      exchangeCodeForSession: (...args: unknown[]) => mockExchange(...args),
    },
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

jest.mock('expo-linking', () => ({ createURL: () => 'destrava://' }));
jest.mock('expo-web-browser', () => ({ openAuthSessionAsync: jest.fn() }));

const mockOpen = WebBrowser.openAuthSessionAsync as jest.Mock;
const SESSION = { access_token: 'abc' };

describe('RNF06: signInWithGoogle', () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockResolvedValue({ data: { url: 'https://auth/google' }, error: null });
  });
  afterEach(() => jest.clearAllMocks());

  it('abre o Google e grava a sessão com os tokens da volta', async () => {
    mockOpen.mockResolvedValue({
      type: 'success',
      url: 'destrava://#access_token=abc&refresh_token=def',
    });
    mockSetSession.mockResolvedValue({ data: { session: SESSION }, error: null });

    await expect(signInWithGoogle()).resolves.toBe(SESSION);

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'destrava://', skipBrowserRedirect: true },
    });
    expect(mockOpen).toHaveBeenCalledWith('https://auth/google', 'destrava://');
    expect(mockSetSession).toHaveBeenCalledWith({ access_token: 'abc', refresh_token: 'def' });
  });

  it('troca o code pela sessão no fluxo PKCE', async () => {
    mockOpen.mockResolvedValue({ type: 'success', url: 'destrava://?code=xyz' });
    mockExchange.mockResolvedValue({ data: { session: SESSION }, error: null });

    await expect(signInWithGoogle()).resolves.toBe(SESSION);
    expect(mockExchange).toHaveBeenCalledWith('xyz');
  });

  it('fechar o navegador não é erro', async () => {
    mockOpen.mockResolvedValue({ type: 'cancel' });
    await expect(signInWithGoogle()).resolves.toBeNull();
    expect(mockSetSession).not.toHaveBeenCalled();
  });

  it('propaga os erros do provedor e do Supabase', async () => {
    mockOpen.mockResolvedValue({ type: 'success', url: 'destrava://?error=access_denied' });
    await expect(signInWithGoogle()).rejects.toThrow('access_denied');

    mockOpen.mockResolvedValue({ type: 'success', url: 'destrava://?code=xyz' });
    const exchangeError = new Error('code inválido');
    mockExchange.mockResolvedValue({ data: { session: null }, error: exchangeError });
    await expect(signInWithGoogle()).rejects.toBe(exchangeError);

    mockOpen.mockResolvedValue({
      type: 'success',
      url: 'destrava://#access_token=a&refresh_token=b',
    });
    const sessionError = new Error('token inválido');
    mockSetSession.mockResolvedValue({ data: { session: null }, error: sessionError });
    await expect(signInWithGoogle()).rejects.toBe(sessionError);

    const providerError = { code: 'provider_disabled' };
    mockSignInWithOAuth.mockResolvedValue({ data: { url: null }, error: providerError });
    await expect(signInWithGoogle()).rejects.toBe(providerError);
    expect(getAuthErrorMessage(providerError)).toBe(
      'O login com Google ainda não está disponível.',
    );
  });
});

describe('RNF06: completeRoleChoice', () => {
  afterEach(() => jest.clearAllMocks());

  it('responsável envia papel, versão dos termos, consentimento do menor e celular E.164', async () => {
    mockRpc.mockResolvedValue({ data: 'guardian', error: null });

    await expect(completeRoleChoice({ role: 'guardian', phone: '(11) 99999-1234' })).resolves.toBe(
      'guardian',
    );

    expect(mockRpc).toHaveBeenCalledWith('complete_role_choice', {
      p_role: 'guardian',
      p_terms_version: TERMS_VERSION,
      p_minor_data_consent: true,
      p_phone: '+5511999991234',
    });
  });

  it('professor não envia consentimento de menor; celular inválido não vai', async () => {
    mockRpc.mockResolvedValue({ data: 'teacher', error: null });

    await completeRoleChoice({ role: 'teacher', phone: '123' });

    expect(mockRpc).toHaveBeenCalledWith('complete_role_choice', {
      p_role: 'teacher',
      p_terms_version: TERMS_VERSION,
      p_minor_data_consent: false,
    });
  });

  it('propaga e traduz o erro do banco', async () => {
    const error = { message: 'role_already_chosen' };
    mockRpc.mockResolvedValue({ data: null, error });

    await expect(completeRoleChoice({ role: 'teacher', phone: '' })).rejects.toBe(error);
    expect(getAuthErrorMessage(error)).toBe(
      'Seu perfil já foi definido. Entre de novo para continuar.',
    );
  });
});
