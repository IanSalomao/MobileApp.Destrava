import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Minha assinatura: plano, situação (teste, ativa, cancelada), cartão, cobranças simuladas,
// cancelar e retomar (RF13). Rota provisória até a tela ser desenvolvida.
export default function SubscriptionScreen() {
  return (
    <ScreenPlaceholder
      owner="Ian Salomão"
      links={[{ label: 'Atualizar cartão', href: '/subscription/card' }]}
    />
  );
}
