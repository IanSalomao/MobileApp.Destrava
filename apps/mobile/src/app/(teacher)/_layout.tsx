import { Stack } from 'expo-router';

// Área exclusiva de professores. O acesso é controlado no layout raiz (Stack.Protected).
export default function TeacherLayout() {
  return (
    <Stack>
      <Stack.Screen name="received-requests" options={{ title: 'Solicitações recebidas' }} />
    </Stack>
  );
}
