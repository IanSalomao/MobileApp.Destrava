import { QueryClientProvider } from '@tanstack/react-query';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { canAccess } from '@/features/auth/route-access';
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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Abas são públicas: visitantes navegam sem conta (RF03). */}
      <Stack.Screen name="(tabs)" />
      {/* Login e cadastro só existem para quem está deslogado; ao entrar, o usuário volta às abas. */}
      <Stack.Protected guard={canAccess('guest', access)}>
        <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      {/* Áreas por papel (AUT-05): quem não tem o papel é redirecionado para as abas. */}
      <Stack.Protected guard={canAccess('guardian', access)}>
        <Stack.Screen name="(guardian)" />
      </Stack.Protected>
      <Stack.Protected guard={canAccess('teacher', access)}>
        <Stack.Screen name="(teacher)" />
      </Stack.Protected>
    </Stack>
  );
}
