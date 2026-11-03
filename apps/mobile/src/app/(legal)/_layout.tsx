import { Stack } from 'expo-router';

// Documentos legais: públicos, abertos pelos links do cadastro.
export default function LegalLayout() {
  return (
    <Stack>
      <Stack.Screen name="terms" options={{ title: 'Termos de Uso' }} />
      <Stack.Screen name="privacy" options={{ title: 'Política de Privacidade' }} />
    </Stack>
  );
}
