import { Stack } from 'expo-router';

// Login é a primeira tela do fluxo de auth (RF03). Login e escolha de perfil têm layout próprio
// (sem header nativo); as demais usam o header com título.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-up" options={{ headerShown: true, title: 'Criar conta' }} />
      <Stack.Screen
        name="forgot-password"
        options={{ headerShown: true, title: 'Esqueci minha senha' }}
      />
    </Stack>
  );
}
