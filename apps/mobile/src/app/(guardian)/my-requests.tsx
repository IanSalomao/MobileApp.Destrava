import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';

// Casca da lista de solicitações do responsável (RF14). O conteúdo entra nas tasks de solicitação.
export default function MyRequestsScreen() {
  return (
    <Screen>
      <Text variant="subtitle">Minhas solicitações</Text>
      <Text color="textMuted">
        Aqui você vai acompanhar os pedidos de contato que enviou aos professores.
      </Text>
    </Screen>
  );
}
