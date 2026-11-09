import { Stack } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import AuthLayout from '@/app/(auth)/_layout';
import RootLayout from '@/app/_layout';
import type { UserRole } from '@/features/profile/types';

// RF03 e AUT-05: sem sessão não há navegação pelo app e a primeira tela é o cadastro (escolha de
// perfil); logado, cada papel só abre a própria área e começa no próprio início. Usa o layout raiz
// e o do fluxo de auth de verdade, com telas de mentira, para testar as guardas e os
// redirecionamentos do Expo Router.

type MockSession = { user: { id: string } } | null;

// Sessão e papel controlados pelo teste. O prefixo `mock` deixa o jest.mock enxergar as variáveis.
let mockSession: MockSession = null;
let mockRole: UserRole | null | undefined;
const mockListeners = new Set<() => void>();

/** Loga com o papel dado (null = logado sem papel, como no login com Google) ou desloga. */
function setSession(role: UserRole | null | 'signed-out') {
  mockSession = role === 'signed-out' ? null : { user: { id: `${role ?? 'sem-papel'}-1` } };
  mockRole = role === 'signed-out' ? undefined : role;
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
    data: mockSession ? { role: mockRole } : undefined,
  }),
}));

const stub = (label: string) =>
  function StubScreen() {
    return <Text>{label}</Text>;
  };

const NestedStack = () => <Stack />;

const WELCOME = 'Como você quer usar o app?';
const GUARDIAN_HOME = 'Início do responsável';
const TEACHER_HOME = 'Início do professor';

const routes = {
  _layout: RootLayout,
  '(auth)/_layout': AuthLayout,
  '(auth)/welcome': stub(WELCOME),
  '(auth)/sign-in': stub('Entre na sua conta'),
  '(auth)/sign-up': stub('Criar conta'),
  '(auth)/forgot-password': stub('Esqueci minha senha'),
  '(onboarding)/_layout': NestedStack,
  '(onboarding)/guardian-profile': stub('Perfil do responsável'),
  '(onboarding)/choose-role': stub('Escolha de papel'),
  '(guardian)/_layout': NestedStack,
  '(guardian)/(tabs)/_layout': NestedStack,
  '(guardian)/(tabs)/index': stub(GUARDIAN_HOME),
  '(guardian)/(tabs)/my-requests': stub('Minhas solicitações'),
  '(guardian)/(tabs)/account': stub('Perfil do responsável logado'),
  '(guardian)/search': stub('Resultado da busca'),
  '(teacher)/_layout': NestedStack,
  '(teacher)/(tabs)/_layout': NestedStack,
  '(teacher)/(tabs)/dashboard': stub(TEACHER_HOME),
  '(teacher)/(tabs)/received-requests': stub('Solicitações recebidas'),
  '(shared)/_layout': NestedStack,
  '(shared)/notifications': stub('Notificações'),
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
    expect(screen.queryByText(GUARDIAN_HOME)).toBeNull();
  });

  it.each([
    ['uma aba do responsável', '/my-requests', 'Minhas solicitações'],
    ['uma tela do responsável', '/search', 'Resultado da busca'],
    ['o início do professor', '/dashboard', TEACHER_HOME],
    ['uma tela comum aos dois papéis', '/notifications', 'Notificações'],
    ['o onboarding', '/guardian-profile', 'Perfil do responsável'],
  ])('visitante que abre %s por link vai para a escolha de perfil', async (_area, url, text) => {
    const router = await renderRouter(routes, { initialUrl: url });

    expect(router.getPathname()).toBe('/welcome');
    expect(screen.getByText(WELCOME)).toBeTruthy();
    expect(screen.queryByText(text)).toBeNull();
  });

  it('ao sair, o usuário volta para a escolha de perfil', async () => {
    setSession('guardian');
    const router = await renderRouter(routes, { initialUrl: '/account' });
    expect(screen.getByText('Perfil do responsável logado')).toBeTruthy();

    await act(() => setSession('signed-out'));

    expect(router.getPathname()).toBe('/welcome');
    expect(screen.getByText(WELCOME)).toBeTruthy();
    expect(screen.queryByText('Perfil do responsável logado')).toBeNull();
  });
});

describe('AUT-05: cada papel abre a própria área', () => {
  beforeEach(() => {
    mockSession = null;
    mockRole = undefined;
  });

  it.each<[UserRole, string, string]>([
    ['guardian', '/', GUARDIAN_HOME],
    ['teacher', '/dashboard', TEACHER_HOME],
  ])('%s logado abre o app no próprio início', async (role, pathname, text) => {
    setSession(role);

    const router = await renderRouter(routes, { initialUrl: '/' });

    expect(router.getPathname()).toBe(pathname);
    expect(screen.getByText(text)).toBeTruthy();
    expect(screen.queryByText(WELCOME)).toBeNull();
  });

  it('logado sem papel (login com Google) vai para a escolha de papel', async () => {
    setSession(null);

    const router = await renderRouter(routes, { initialUrl: '/' });

    expect(router.getPathname()).toBe('/choose-role');
    expect(screen.getByText('Escolha de papel')).toBeTruthy();
  });

  it('usuário logado que abre o cadastro por link vai para o próprio início', async () => {
    setSession('teacher');

    const router = await renderRouter(routes, { initialUrl: '/welcome' });

    expect(router.getPathname()).toBe('/dashboard');
    expect(screen.getByText(TEACHER_HOME)).toBeTruthy();
  });

  it('professor que abre a área do responsável vai para o início do professor', async () => {
    setSession('teacher');

    const router = await renderRouter(routes, { initialUrl: '/my-requests' });

    expect(router.getPathname()).toBe('/dashboard');
    expect(screen.queryByText('Minhas solicitações')).toBeNull();
  });

  it('responsável que abre a área do professor vai para o início do responsável', async () => {
    setSession('guardian');

    const router = await renderRouter(routes, { initialUrl: '/received-requests' });

    expect(router.getPathname()).toBe('/');
    expect(screen.queryByText('Solicitações recebidas')).toBeNull();
  });

  it.each<UserRole>(['guardian', 'teacher'])('%s abre as telas comuns', async (role) => {
    setSession(role);

    const router = await renderRouter(routes, { initialUrl: '/notifications' });

    expect(router.getPathname()).toBe('/notifications');
    expect(screen.getByText('Notificações')).toBeTruthy();
  });

  it.each<[UserRole, string, string]>([
    ['guardian', '/', GUARDIAN_HOME],
    ['teacher', '/dashboard', TEACHER_HOME],
  ])('ao entrar como %s, o visitante sai do cadastro e vai ao início', async (role, path, text) => {
    const router = await renderRouter(routes, { initialUrl: '/' });

    await act(() => setSession(role));

    expect(router.getPathname()).toBe(path);
    expect(screen.getByText(text)).toBeTruthy();
  });
});
