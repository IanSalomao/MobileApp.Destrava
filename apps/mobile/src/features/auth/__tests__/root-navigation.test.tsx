import { Stack } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import AuthLayout from '@/app/(auth)/_layout';
import RootLayout, { unstable_settings } from '@/app/_layout';
import type { UserRole } from '@/features/profile/types';

// RF03: sem sessão não há navegação pelo app e a primeira tela é o cadastro (escolha de perfil).
// Usa o layout raiz e o do fluxo de auth de verdade, com telas de mentira, para testar as guardas e
// os redirecionamentos do Expo Router.

type MockSession = { user: { id: string } } | null;

// Sessão e papel controlados pelo teste. O prefixo `mock` deixa o jest.mock enxergar as variáveis.
let mockSession: MockSession = null;
let mockRole: UserRole | undefined;
const mockListeners = new Set<() => void>();

function setSession(role: UserRole | null) {
  mockSession = role ? { user: { id: `${role}-1` } } : null;
  mockRole = role ?? undefined;
  mockListeners.forEach((listener) => listener());
}

jest.mock('@/features/auth/session-provider', () => {
  const { useSyncExternalStore } = jest.requireActual<typeof import('react')>('react');
  const subscribe = (listener: () => void) => {
    mockListeners.add(listener);
    return () => mockListeners.delete(listener);
  };

  return {
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
    useSession: () => ({
      session: useSyncExternalStore(subscribe, () => mockSession),
      isLoading: false,
    }),
  };
});

// O perfil vem do Supabase; aqui basta o papel do usuário logado.
jest.mock('@/features/profile/hooks', () => ({
  useMyProfile: () => ({
    isPending: false,
    data: mockRole ? { role: mockRole } : undefined,
  }),
}));

const stub = (label: string) =>
  function StubScreen() {
    return <Text>{label}</Text>;
  };

const NestedStack = () => <Stack />;

const WELCOME = 'Como você quer usar o app?';

const routes = {
  _layout: { default: RootLayout, unstable_settings },
  '(tabs)/_layout': NestedStack,
  '(tabs)/index': stub('Início'),
  '(tabs)/account': stub('Conta'),
  '(auth)/_layout': AuthLayout,
  '(auth)/welcome': stub(WELCOME),
  '(auth)/sign-in': stub('Entre na sua conta'),
  '(auth)/sign-up': stub('Criar conta'),
  '(auth)/forgot-password': stub('Esqueci minha senha'),
  '(onboarding)/_layout': NestedStack,
  '(onboarding)/guardian-profile': stub('Perfil do responsável'),
  '(guardian)/_layout': NestedStack,
  '(guardian)/my-requests': stub('Minhas solicitações'),
  '(teacher)/_layout': NestedStack,
  '(teacher)/received-requests': stub('Solicitações recebidas'),
};

describe('RF03: navegação exige login e começa no cadastro', () => {
  beforeEach(() => {
    // Sem avisar os ouvintes: a árvore do teste anterior já foi desmontada.
    mockSession = null;
    mockRole = undefined;
  });

  it('visitante abre o app na escolha de perfil, sem as abas', async () => {
    const router = await renderRouter(routes, { initialUrl: '/' });

    expect(router.getPathname()).toBe('/welcome');
    expect(screen.getByText(WELCOME)).toBeTruthy();
    expect(screen.queryByText('Início')).toBeNull();
  });

  it.each([
    ['uma aba', '/account', 'Conta'],
    ['o onboarding', '/guardian-profile', 'Perfil do responsável'],
    ['a área do responsável', '/my-requests', 'Minhas solicitações'],
    ['a área do professor', '/received-requests', 'Solicitações recebidas'],
  ])('visitante que abre %s por link vai para a escolha de perfil', async (_area, url, text) => {
    const router = await renderRouter(routes, { initialUrl: url });

    expect(router.getPathname()).toBe('/welcome');
    expect(screen.getByText(WELCOME)).toBeTruthy();
    expect(screen.queryByText(text)).toBeNull();
  });

  it('usuário logado abre o app nas abas, sem o cadastro', async () => {
    setSession('guardian');

    const router = await renderRouter(routes, { initialUrl: '/' });

    expect(router.getPathname()).toBe('/');
    expect(screen.getByText('Início')).toBeTruthy();
    expect(screen.queryByText(WELCOME)).toBeNull();
  });

  it('usuário logado que abre o cadastro por link vai para as abas', async () => {
    setSession('guardian');

    const router = await renderRouter(routes, { initialUrl: '/welcome' });

    expect(router.getPathname()).toBe('/');
    expect(screen.getByText('Início')).toBeTruthy();
  });

  it('professor que abre a área do responsável vai para as abas', async () => {
    setSession('teacher');

    const router = await renderRouter(routes, { initialUrl: '/my-requests' });

    expect(router.getPathname()).toBe('/');
    expect(screen.queryByText('Minhas solicitações')).toBeNull();
  });

  it('ao entrar, o visitante sai do cadastro e vai para as abas', async () => {
    const router = await renderRouter(routes, { initialUrl: '/' });

    await act(() => setSession('guardian'));

    expect(router.getPathname()).toBe('/');
    expect(screen.getByText('Início')).toBeTruthy();
  });

  it('ao sair, o usuário volta para a escolha de perfil', async () => {
    setSession('guardian');
    const router = await renderRouter(routes, { initialUrl: '/account' });
    expect(screen.getByText('Conta')).toBeTruthy();

    await act(() => setSession(null));

    expect(router.getPathname()).toBe('/welcome');
    expect(screen.getByText(WELCOME)).toBeTruthy();
    expect(screen.queryByText('Conta')).toBeNull();
  });
});
