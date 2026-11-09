import { Stack } from 'expo-router';

// Telas comuns aos dois papéis. Exigem só estar logado (Stack.Protected no layout raiz) e abrem por
// cima das abas de quem as chamou.
export default function SharedLayout() {
  return (
    <Stack>
      <Stack.Screen name="notifications" options={{ title: 'Notificações' }} />
      <Stack.Screen name="settings" options={{ title: 'Configurações' }} />
      <Stack.Screen name="reviews/[teacherId]" options={{ title: 'Avaliações' }} />
    </Stack>
  );
}
