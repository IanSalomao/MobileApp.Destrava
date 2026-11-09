import { QueryClientProvider } from '@tanstack/react-query';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { canAccess, homeHref } from '@/features/auth/route-access';
import { SessionProvider, useSession } from '@/features/auth/session-provider';
import { useMyProfile } from '@/features/profile/hooks';
import { queryClient } from '@/lib/query-client';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style="dark" />
          <RootNavigator />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const { session, isLoading } = useSession();
  const profile = useMyProfile();

  // Com sessão, a guarda por papel precisa do perfil: espera ele carregar antes de montar as rotas.
  const isResolvingRole = !!session && profile.isPending;
  const isReady = !isLoading && !isResolvingRole;

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  const access = { isSignedIn: !!session, role: profile.data?.role };
  // Quem cai numa área barrada vai para o início do próprio papel (logado) ou para a escolha de
  // perfil (deslogado). Veja `homeHref`.
  const home = homeHref(access);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Áreas por papel (AUT-05), cada uma com as próprias abas: (guardian) começa em "/" e
          (teacher) em "/dashboard". Cadastro obrigatório (RF03): sem sessão não há navegação pelo
          app, e quem não está logado vai para a escolha de perfil, inclusive ao sair da conta. */}
      <Stack.Protected guard={canAccess('guardian', access)} redirectTo={home}>
        <Stack.Screen name="(guardian)" />
      </Stack.Protected>
      <Stack.Protected guard={canAccess('teacher', access)} redirectTo={home}>
        <Stack.Screen name="(teacher)" />
      </Stack.Protected>
      {/* Exigem só estar logado: as telas comuns aos dois papéis (notificações, configurações,
          avaliações de um professor) e o onboarding pós-cadastro, alcançado por router.replace
          logo após o cadastro. */}
      <Stack.Protected guard={access.isSignedIn} redirectTo={home}>
        <Stack.Screen name="(shared)" />
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      {/* Cadastro e login só existem para quem está deslogado; ao entrar, o usuário vai ao início
          do seu papel. */}
      <Stack.Protected guard={canAccess('guest', access)} redirectTo={home}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
