import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { SCHOOL_GRADE_LABELS, TUTORING_TYPE_LABELS } from '@/features/catalog/types';
import { formatDateTime } from '@/lib/date';
import { colors, radius, spacing } from '@/theme';

import type { ContactRequestStatus } from '../../../domain/contact-request';
import { RequestInfoRow } from '../../../components/request-info-row';
import { formatSentAt } from '../domain';
import type { MyContactRequest } from '../types';
import { MyRequestStatusPill } from './my-request-status-pill';
import { WhatsAppButton } from './whatsapp-button';

export type MyRequestDetailViewProps = {
  request: MyContactRequest;
  /** Status exibido (pendente com prazo vencido aparece como expirada). */
  status: ContactRequestStatus;
  canCancel: boolean;
  canAskAgain: boolean;
  isCancelling: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onOpenWhatsApp: () => void;
  onAskAgain: () => void;
  onOpenProfile: () => void;
  onReview: () => void;
};

function StatusBanner({
  request,
  status,
}: {
  request: MyContactRequest;
  status: ContactRequestStatus;
}) {
  switch (status) {
    case 'accepted':
      return (
        <Banner
          variant="success"
          title="Contato liberado"
          description={`O WhatsApp de ${request.teacherName} está liberado.`}
          icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />}
        />
      );
    case 'pending':
      return (
        <Banner
          title="Aguardando resposta"
          description={`${request.teacherName} tem até ${formatDateTime(request.expiresAt)} para responder.`}
          icon={<Ionicons name="time-outline" size={20} color={colors.info} />}
        />
      );
    case 'declined':
      return (
        <Banner
          title="Pedido recusado"
          description="O professor não pôde atender este pedido. O WhatsApp não foi liberado."
          icon={<Ionicons name="lock-closed-outline" size={20} color={colors.info} />}
        />
      );
    case 'expired':
      return (
        <Banner
          variant="warning"
          title="Pedido expirado"
          description="O professor não respondeu dentro de 24 horas."
          icon={<Ionicons name="time-outline" size={20} color={colors.warning} />}
        />
      );
    case 'cancelled':
      return (
        <Banner
          title="Pedido cancelado"
          description="Você cancelou esta solicitação. O WhatsApp não foi liberado."
          icon={<Ionicons name="close-circle-outline" size={20} color={colors.info} />}
        />
      );
  }
}

// Detalhe do pedido do responsável: status, dados enviados e as ações de cada situação (RF09,
// RF10, RF14). Protótipos: "DETALHES DA SOLICITACAO" (ACEITA e RECUSADA).
export function MyRequestDetailView({
  request,
  status,
  canCancel,
  canAskAgain,
  isCancelling,
  errorMessage,
  onCancel,
  onOpenWhatsApp,
  onAskAgain,
  onOpenProfile,
  onReview,
}: MyRequestDetailViewProps) {
  const studentLabel = request.studentAge
    ? `${request.studentName}, ${request.studentAge} anos`
    : request.studentName;
  const preferenceLabel = request.preferredTutoringType
    ? TUTORING_TYPE_LABELS[request.preferredTutoringType]
    : 'Sem preferência';
  const isFinal = status === 'declined' || status === 'expired' || status === 'cancelled';

  return (
    <SafeAreaView edges={['bottom']} style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar name={request.teacherName} imageUrl={request.teacherAvatarUrl} size="lg" />
          <Text variant="heading" style={styles.centered}>
            {request.teacherName}
          </Text>
          <Text variant="caption" color="textMuted">
            {formatSentAt(request.createdAt)}
          </Text>
          <MyRequestStatusPill status={status} />
        </View>

        <View style={styles.infoCard}>
          <RequestInfoRow icon="person-outline" label="Aluno" value={studentLabel} />
          <RequestInfoRow
            icon="school-outline"
            label="Escolaridade"
            value={SCHOOL_GRADE_LABELS[request.schoolGrade]}
          />
          <RequestInfoRow icon="globe-outline" label="Preferência" value={preferenceLabel} last />
        </View>

        <View style={styles.section}>
          <Text variant="subtitle">Motivo do contato</Text>
          <View style={styles.reasonBox}>
            <Text color="textSecondary">“{request.reason.trim()}”</Text>
          </View>
        </View>

        <StatusBanner request={request} status={status} />

        {status === 'accepted' && !request.teacherPhone ? (
          <Text variant="caption" color="warning" style={styles.centered}>
            O professor ainda não cadastrou o WhatsApp.
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {errorMessage ? <Text color="danger">{errorMessage}</Text> : null}

        {status === 'accepted' ? (
          <>
            <WhatsAppButton onPress={onOpenWhatsApp} disabled={!request.teacherPhone} />
            <Button title="Avaliar professor" variant="secondary" onPress={onReview} />
          </>
        ) : null}

        {canCancel ? (
          <Button
            title="Cancelar solicitação"
            variant="secondary"
            loading={isCancelling}
            onPress={onCancel}
          />
        ) : null}

        {isFinal ? (
          <>
            {canAskAgain ? <Button title="Pedir novamente" onPress={onAskAgain} /> : null}
            <Button title="Ver perfil do professor" variant="secondary" onPress={onOpenProfile} />
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  centered: {
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  section: {
    gap: spacing.sm,
  },
  reasonBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  footer: {
    gap: spacing.sm,
    padding: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});