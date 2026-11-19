import { Stack } from 'expo-router';

// Etapas pós-cadastro (já logado). Header nativo com título, como no protótipo.
export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="guardian-profile" options={{ title: 'Criar conta' }} />
      <Stack.Screen name="teacher-subscription" options={{ title: 'Assinatura' }} />
      <Stack.Screen name="teacher-payment-approved" options={{ headerShown: false }} />
      <Stack.Screen name="teacher-professional" options={{ title: 'Cadastro profissional' }} />
    </Stack>
  );
}
