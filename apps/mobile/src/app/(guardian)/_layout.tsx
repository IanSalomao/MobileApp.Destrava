import { Stack } from 'expo-router';

// Área exclusiva do responsável. O acesso é controlado no layout raiz (Stack.Protected): professor ou
// visitante que abrir uma destas rotas é redirecionado. As abas ficam em (tabs); as demais telas
// abrem por cima delas, com header nativo.
export default function GuardianLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ title: 'Professores' }} />
      <Stack.Screen name="search-filters" options={{ title: 'Filtros', presentation: 'modal' }} />
      <Stack.Screen
        name="search-location"
        options={{ title: 'Onde buscar', presentation: 'modal' }}
      />
      <Stack.Screen name="teachers/[id]" options={{ title: 'Professor' }} />
      <Stack.Screen name="write-review/[teacherId]" options={{ title: 'Avaliar professor' }} />
      <Stack.Screen name="favorites" options={{ title: 'Favoritos' }} />
      <Stack.Screen name="contact-request/[teacherId]" options={{ title: 'Solicitar contato' }} />
      <Stack.Screen
        name="contact-request-sent"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="my-requests/[id]" options={{ title: 'Detalhe do pedido' }} />
      <Stack.Screen name="students/[id]" options={{ title: 'Aluno' }} />
    </Stack>
  );
}
