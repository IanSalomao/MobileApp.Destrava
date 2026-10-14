import { QueryClientProvider } from '@tanstack/react-query';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { SessionProvider, useSession } from '@/features/auth/session-provider';
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

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Abas são públicas: visitantes navegam sem conta (RF03). */}
      <Stack.Screen name="(tabs)" />
      {/* Login e cadastro só existem para quem está deslogado; ao entrar, o usuário volta às abas. */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}
