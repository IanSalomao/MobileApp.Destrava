import { Stack } from 'expo-router';

// Área exclusiva do professor. O acesso é controlado no layout raiz (Stack.Protected): responsável
// ou visitante que abrir uma destas rotas é redirecionado. As abas ficam em (tabs); as demais telas
// abrem por cima delas, com header nativo.
export default function TeacherLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="received-requests/[id]" options={{ title: 'Detalhe da solicitação' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Editar perfil' }} />
    </Stack>
  );
}
