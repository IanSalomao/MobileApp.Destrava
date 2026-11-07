import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import ForgotPasswordScreen from '@/app/(auth)/forgot-password';
import SignInScreen from '@/app/(auth)/sign-in';

import { PASSWORD_RESET_CONFIRMATION } from '../password-reset';
import { FakeAuthRepository } from './fake-auth-repository';

// Evita que o cliente real do Supabase exija variáveis .env ou AsyncStorage nos testes.
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
}));

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

async function requestReset(email: string) {
  await fireEvent.changeText(screen.getByLabelText('E-mail'), email);
  await fireEvent.press(screen.getByRole('button', { name: 'Enviar link' }));
}

describe('AUT-04 ViewModel & Component: ForgotPasswordScreen ("Esqueci minha senha")', () => {
  afterEach(() => jest.clearAllMocks());

  it('renderiza o campo de e-mail e o botão Enviar link', async () => {
    await renderWithQueryClient(<ForgotPasswordScreen repository={new FakeAuthRepository()} />);

    expect(screen.getByText('Esqueci minha senha')).toBeTruthy();
    expect(screen.getByLabelText('E-mail')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enviar link' })).toBeTruthy();
  });

  it('Dado e-mail inválido, Quando solicito, Então mostra o erro de campo e NÃO chama a API', async () => {
    const fakeRepo = new FakeAuthRepository();
    await renderWithQueryClient(<ForgotPasswordScreen repository={fakeRepo} />);

    await requestReset('formato-invalido');

    await waitFor(() => expect(screen.getByText('Informe um e-mail válido.')).toBeTruthy());
    expect(fakeRepo.passwordResetRequests).toHaveLength(0);
  });

  it('Dado e-mail cadastrado, Quando solicito, Então envia o e-mail normalizado e mostra a confirmação', async () => {
    const fakeRepo = new FakeAuthRepository();
    await renderWithQueryClient(<ForgotPasswordScreen repository={fakeRepo} />);

    await requestReset('  PAI@destrava.com ');

    await waitFor(() => expect(screen.getByText(PASSWORD_RESET_CONFIRMATION)).toBeTruthy());
    expect(fakeRepo.passwordResetRequests).toEqual([{ email: 'pai@destrava.com' }]);
  });

  it('Dado e-mail inexistente, Quando solicito, Então mostra EXATAMENTE a mesma confirmação (sem vazar a existência)', async () => {
    const fakeRepo = new FakeAuthRepository();
    await renderWithQueryClient(<ForgotPasswordScreen repository={fakeRepo} />);

    await requestReset('ninguem@exemplo.com');

    await waitFor(() => expect(screen.getByText(PASSWORD_RESET_CONFIRMATION)).toBeTruthy());
    expect(fakeRepo.passwordResetRequests).toEqual([{ email: 'ninguem@exemplo.com' }]);
    expect(screen.queryByText(/não encontrado|não existe|não cadastrad/i)).toBeNull();
  });

  it('mostra o estado de carregamento e bloqueia o envio repetido enquanto aguarda', async () => {
    const fakeRepo = new FakeAuthRepository();
    fakeRepo.holdResponses = true;
    await renderWithQueryClient(<ForgotPasswordScreen repository={fakeRepo} />);

    await requestReset('pai@destrava.com');

    await waitFor(() => expect(screen.getByTestId('button-loading-indicator')).toBeTruthy());
    expect(screen.getByLabelText('E-mail').props.editable).toBe(false);

    fakeRepo.releaseResponses();
    await waitFor(() => expect(screen.getByText(PASSWORD_RESET_CONFIRMATION)).toBeTruthy());
    expect(fakeRepo.passwordResetRequests).toHaveLength(1);
  });

  it('Dado falha de rede, Quando solicito, Então mostra erro e não finge que enviou', async () => {
    const fakeRepo = new FakeAuthRepository();
    fakeRepo.shouldFailWithNetworkError = true;
    await renderWithQueryClient(<ForgotPasswordScreen repository={fakeRepo} />);

    await requestReset('pai@destrava.com');

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.queryByText(PASSWORD_RESET_CONFIRMATION)).toBeNull();
  });

  it('depois da confirmação, "Voltar ao login" leva à tela de login', async () => {
    await renderWithQueryClient(<ForgotPasswordScreen repository={new FakeAuthRepository()} />);

    await requestReset('pai@destrava.com');
    await waitFor(() => expect(screen.getByText(PASSWORD_RESET_CONFIRMATION)).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar ao login' }));

    expect(router.replace).toHaveBeenCalledWith('/sign-in');
  });
});

describe('AUT-04: acesso a partir do login', () => {
  afterEach(() => jest.clearAllMocks());

  it('"Esqueci minha senha" na tela de login abre a recuperação', async () => {
    await renderWithQueryClient(<SignInScreen repository={new FakeAuthRepository()} />);

    await fireEvent.press(screen.getByText('Esqueci minha senha'));

    expect(router.push).toHaveBeenCalledWith('/forgot-password');
  });
});
