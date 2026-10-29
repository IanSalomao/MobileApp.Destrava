import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SignInScreen from '@/app/(auth)/sign-in';

import { FakeAuthRepository } from './fake-auth-repository';

// Impede que o cliente real do Supabase exija variáveis .env ou AsyncStorage nos testes unitários/componentes
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('AUT-02 ViewModel & Component: SignInScreen ("Entre na sua conta")', () => {
  it('renderiza a tela "Entre na sua conta" com campos de E-mail, Senha e botão Entrar', () => {
    const fakeRepo = new FakeAuthRepository();
    renderWithQueryClient(<SignInScreen repository={fakeRepo} />);

    expect(screen.getByText('Entre na sua conta')).toBeTruthy();
    expect(screen.getByLabelText('E-mail')).toBeTruthy();
    expect(screen.getByLabelText('Senha')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeTruthy();
  });

  it('Dado formato inválido (Zod), Quando tento entrar, Então exibe erros de campo e NÃO chama a API', async () => {
    const fakeRepo = new FakeAuthRepository();
    renderWithQueryClient(<SignInScreen repository={fakeRepo} />);

    fireEvent.changeText(screen.getByLabelText('E-mail'), 'formato-invalido');
    fireEvent.changeText(screen.getByLabelText('Senha'), '');
    fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(screen.getByText('Informe um e-mail válido.')).toBeTruthy();
      expect(screen.getByText('Informe a senha.')).toBeTruthy();
    });

    expect(fakeRepo.calls).toHaveLength(0);
  });

  it('Dado credenciais inválidas, Quando tento entrar, Então mostra "E-mail ou senha inválidos" sem revelar qual campo errou', async () => {
    const fakeRepo = new FakeAuthRepository();
    renderWithQueryClient(<SignInScreen repository={fakeRepo} />);

    fireEvent.changeText(screen.getByLabelText('E-mail'), 'pai@destrava.com');
    fireEvent.changeText(screen.getByLabelText('Senha'), 'senha-errada');
    fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha inválidos')).toBeTruthy();
    });

    expect(fakeRepo.calls).toHaveLength(1);
    expect(screen.queryByText('Informe um e-mail válido.')).toBeNull();
    expect(screen.queryByText('Informe a senha.')).toBeNull();
  });

  it('Dado credenciais válidas, Quando clico em Entrar, Então envia dados normalizados para o AuthRepository', async () => {
    const fakeRepo = new FakeAuthRepository();
    renderWithQueryClient(<SignInScreen repository={fakeRepo} />);

    fireEvent.changeText(screen.getByLabelText('E-mail'), '  PAI@destrava.com ');
    fireEvent.changeText(screen.getByLabelText('Senha'), 'password123');
    fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(fakeRepo.calls).toEqual([{ email: 'pai@destrava.com', password: 'password123' }]);
    });

    expect(screen.queryByText('E-mail ou senha inválidos')).toBeNull();
  });
});
