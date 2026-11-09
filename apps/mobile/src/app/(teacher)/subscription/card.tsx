import { router } from 'expo-router';

import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Cadastro ou troca do cartão da assinatura (RF13). O app só envia bandeira, últimos 4 dígitos e
// validade. Reaproveita o formulário de (onboarding)/teacher-subscription. Rota provisória até a
// tela ser desenvolvida.
export default function SubscriptionCardScreen() {
  return (
    <ScreenPlaceholder
      owner="Ian Salomão"
      links={[{ label: 'Salvar cartão', onPress: () => router.back() }]}
    />
  );
}
