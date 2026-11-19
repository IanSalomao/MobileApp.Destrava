import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { MyRequestDetailView } from '@/features/contact-requests/guardian/my-requests/components/my-request-detail-view';
import {
  useCancelContactRequest,
  useMyContactRequest,
  useOpenTeacherWhatsApp,
} from '@/features/contact-requests/guardian/my-requests/hooks';
import { colors, spacing } from '@/theme';

function StateMessage({ message }: { message: string }) {
  return (
    <View style={styles.state}>
      <Text variant="subtitle" color="danger" style={styles.centered}>
        Não foi possível abrir o pedido
      </Text>
      <Text color="textMuted" style={styles.centered}>
        {message}
      </Text>
      <Button title="Voltar às solicitações" variant="secondary" onPress={() => router.back()} />
    </View>
  );
}

// Detalhe do pedido do responsável: status, dados enviados, WhatsApp depois do aceite, cancelar
// enquanto pendente e pedir de novo quando recusado, expirado ou cancelado (RF09, RF10, RF14).
// Protótipos: "DETALHES DA SOLICITACAO" (ACEITA e RECUSADA).
export default function MyRequestDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const requestId = Array.isArray(params.id) ? params.id[0] : params.id;

  const query = useMyContactRequest(requestId);
  const cancel = useCancelContactRequest(requestId);
  const whatsapp = useOpenTeacherWhatsApp();

  if (!requestId) return <StateMessage message="Solicitação não encontrada." />;

  if (query.isPending) {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text color="textMuted">Carregando...</Text>
      </View>
    );
  }

  const request = query.data;
  if (query.isError || !request || !query.displayStatus) {
    return (
      <StateMessage message={query.errorMessage ?? 'Não foi possível carregar a solicitação.'} />
    );
  }

  const confirmCancel = () => {
    Alert.alert(
      'Cancelar solicitação?',
      `O pedido para ${request.teacherName} será cancelado. Depois você pode enviar outro.`,
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Cancelar solicitação', style: 'destructive', onPress: () => cancel.mutate() },
      ],
    );
  };

  return (
    <MyRequestDetailView
      request={request}
      status={query.displayStatus}
      canCancel={query.canCancel}
      canAskAgain={query.canAskAgain}
      isCancelling={cancel.isPending}
      errorMessage={cancel.errorMessage ?? whatsapp.errorMessage}
      onCancel={confirmCancel}
      onOpenWhatsApp={() => void whatsapp.open(request)}
      onAskAgain={() =>
        router.push({
          pathname: '/contact-request/[teacherId]',
          params: { teacherId: request.teacherId },
        })
      }
      onOpenProfile={() =>
        router.push({ pathname: '/teachers/[id]', params: { id: request.teacherId } })
      }
      onReview={() =>
        router.push({
          pathname: '/write-review/[teacherId]',
          params: { teacherId: request.teacherId },
        })
      }
    />
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  centered: {
    textAlign: 'center',
  },
});
