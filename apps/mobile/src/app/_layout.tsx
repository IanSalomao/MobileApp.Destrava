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

export const unstable_settings = {
  anchor: '(tabs)',
};

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
  // Quem cai numa área barrada vai para as abas (logado) ou para a escolha de perfil (deslogado).
  const home = homeHref(access);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Cadastro obrigatório (RF03): sem sessão não há navegação pelo app. Quem não está logado
          vai para a escolha de perfil, inclusive ao sair da conta. */}
      <Stack.Protected guard={access.isSignedIn} redirectTo={home}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      {/* Cadastro e login só existem para quem está deslogado; ao entrar, o usuário vai às abas. */}
      <Stack.Protected guard={canAccess('guest', access)} redirectTo={home}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      {/* Onboarding pós-cadastro (etapa 2 do responsável; assinatura e perfil do professor): exige
          apenas estar logado. As telas são alcançadas por router.replace logo após o cadastro. */}
      <Stack.Protected guard={access.isSignedIn} redirectTo={home}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      {/* Áreas por papel (AUT-05): quem não tem o papel vai para as abas, ou para a escolha de
          perfil se nem está logado. */}
      <Stack.Protected guard={canAccess('guardian', access)} redirectTo={home}>
        <Stack.Screen name="(guardian)" />
      </Stack.Protected>
      <Stack.Protected guard={canAccess('teacher', access)} redirectTo={home}>
        <Stack.Screen name="(teacher)" />
      </Stack.Protected>
    </Stack>
  );
}
