import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ title: 'Bem-vindo' }} />
      <Stack.Screen name="sign-in" options={{ title: 'Entrar' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Esqueci minha senha' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Criar conta' }} />
    </Stack>
  );
}
