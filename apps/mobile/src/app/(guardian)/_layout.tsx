import { Stack } from 'expo-router';

// Área exclusiva de responsáveis. O acesso é controlado no layout raiz (Stack.Protected).
export default function GuardianLayout() {
  return (
    <Stack>
      <Stack.Screen name="my-requests" options={{ title: 'Minhas solicitações' }} />
    </Stack>
  );
}
