import { Stack } from 'expo-router';

// A escolha de perfil (welcome) é a primeira tela do app para quem não está logado (RF03): as guardas
// do layout raiz redirecionam o visitante para /welcome (veja `homeHref`).
// Escolha de perfil e login têm layout próprio (sem header nativo); as demais usam o header.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" options={{ headerShown: true, title: 'Criar conta' }} />
      <Stack.Screen
        name="forgot-password"
        options={{ headerShown: true, title: 'Esqueci minha senha' }}
      />
    </Stack>
  );
}
