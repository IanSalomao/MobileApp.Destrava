import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';

// Casca da lista de solicitações do professor (RF15). O conteúdo entra nas tasks de aceite/recusa.
export default function ReceivedRequestsScreen() {
  return (
    <Screen>
      <Text variant="subtitle">Solicitações recebidas</Text>
      <Text color="textMuted">
        Aqui você vai ver os pedidos de contato das famílias e poderá aceitar ou recusar.
      </Text>
    </Screen>
  );
}
