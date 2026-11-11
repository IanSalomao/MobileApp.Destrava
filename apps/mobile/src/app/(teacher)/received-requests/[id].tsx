import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { ReceivedContactRequestDetail } from '@/features/contact-requests/api';
import { RequestInfoRow } from '@/features/contact-requests/components/request-info-row';
import {
  RequestStatusPill,
  type RequestDetailStatus,
} from '@/features/contact-requests/components/request-status-pill';
import { isExpired } from '@/features/contact-requests/domain/contact-request';
import {
  useAnswerContactRequest,
  useGuardianContactDetails,
  useReceivedContactRequest,
} from '@/features/contact-requests/hooks';
import { SCHOOL_GRADE_LABELS } from '@/features/catalog/types';
import { useMyProfile } from '@/features/profile/hooks';
import { formatDateTime } from '@/lib/date';
import { formatRelativeTime } from '@/lib/relative-time';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { colors, radius, spacing } from '@/theme';

type DisplayStatus = 'pending' | RequestDetailStatus;

const PREFERENCE_LABELS: Record<
  NonNullable<ReceivedContactRequestDetail['preferredTutoringType']>,
  string
> = {
  online: 'Aulas online',
  in_person: 'Aulas presenciais',
};

function getDisplayStatus(request: ReceivedContactRequestDetail): DisplayStatus {
  if (request.status === 'pending' && isExpired(request)) return 'expired';
  return request.status;
}

function sentAtLabel(createdAt: Date): string {
  const relative = formatRelativeTime(createdAt);
  return relative === 'Agora' ? 'Pedido enviado agora' : `Pedido enviado ${relative.toLowerCase()}`;
}

function ContactBanner({ status }: { status: DisplayStatus }) {
  if (status === 'accepted') {
    return (
      <Banner
        variant="success"
        title="Contato liberado"
        description="O WhatsApp do responsável está liberado."
        icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />}
      />
    );
  }

  if (status === 'pending') {
    return (
      <Banner
        variant="info"
        title="Contato seguro"
        description="Após aceitar, o WhatsApp de vocês dois será liberado."
        icon={<Ionicons name="lock-closed-outline" size={20} color={colors.info} />}
      />
    );
  }

  return (
    <Banner
      variant="info"
      title="Contato não liberado"
      description="O WhatsApp só é liberado quando você aceita o pedido."
      icon={<Ionicons name="lock-closed-outline" size={20} color={colors.info} />}
    />
  );
}

function StateMessage({ message }: { message: string }) {
  return (
    <View style={styles.state}>
      <Text variant="subtitle" color="danger" style={styles.stateText}>
        Não foi possível abrir a solicitação
      </Text>
      <Text color="textMuted" style={styles.stateText}>
        {message}
      </Text>
      <Button title="Voltar às solicitações" variant="secondary" onPress={() => router.back()} />
    </View>
  );
}

export default function ReceivedRequestDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const requestId = Array.isArray(params.id) ? params.id[0] : params.id;

  const query = useReceivedContactRequest(requestId);
  const profile = useMyProfile();
  const request = query.data;
  const isAccepted = request?.status === 'accepted';
  const contact = useGuardianContactDetails(request?.guardianId, isAccepted);
  const answer = useAnswerContactRequest(requestId);
  const [linkError, setLinkError] = useState<string | null>(null);

  if (!requestId) return <StateMessage message="Solicitação não encontrada." />;

  if (query.isPending) {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text color="textMuted">Carregando...</Text>
      </View>
    );
  }

  if (query.isError || !request) {
    return (
      <StateMessage message={query.errorMessage ?? 'Não foi possível carregar a solicitação.'} />
    );
  }

  const displayStatus = getDisplayStatus(request);
  const canAnswer = query.canAccept && query.canDecline;
  const studentLabel = request.studentAge
    ? `${request.studentName}, ${request.studentAge} anos`
    : request.studentName;
  const preferenceLabel = request.preferredTutoringType
    ? PREFERENCE_LABELS[request.preferredTutoringType]
    : 'Sem preferência';
  const contactWarning = contact.isError
    ? 'Não foi possível carregar o WhatsApp do responsável.'
    : contact.data === null && !contact.isPending
      ? 'O responsável ainda não cadastrou o WhatsApp.'
      : null;

  const handleWhatsApp = async () => {
    if (!contact.data) return;
    setLinkError(null);

    const teacherName = profile.data?.full_name?.trim() || 'Professor';
    const message = `Olá, ${request.guardianName}! Aqui é ${teacherName}. Recebi seu pedido de contato para ${request.studentName} e podemos conversar por aqui.`;
    const url = buildWhatsAppUrl(contact.data, message);

    if (!url) {
      setLinkError('Não foi possível montar o link do WhatsApp.');
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      setLinkError('Não foi possível abrir o WhatsApp.');
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar name={request.guardianName} imageUrl={request.guardianAvatarUrl} size="lg" />
          <Text variant="heading" style={styles.name}>
            {request.guardianName}
          </Text>
          <Text variant="caption" color="textMuted">
            {sentAtLabel(request.createdAt)}
          </Text>
          {displayStatus !== 'pending' ? <RequestStatusPill status={displayStatus} /> : null}
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
            <Text variant="body" color="textSecondary">
              “{request.reason.trim()}”
            </Text>
          </View>
        </View>

        <ContactBanner status={displayStatus} />

        {displayStatus === 'pending' ? (
          <Text variant="caption" color="textMuted" style={styles.deadline}>
            Responda até {formatDateTime(request.expiresAt)}
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {answer.errorMessage ? <Text color="danger">{answer.errorMessage}</Text> : null}
        {linkError ? <Text color="danger">{linkError}</Text> : null}

        {canAnswer ? (
          <View style={styles.actionsRow}>
            <Button
              title="Recusar"
              variant="secondary"
              style={styles.actionButton}
              onPress={() => answer.mutate('declined')}
              loading={answer.isPending && answer.variables === 'declined'}
              disabled={answer.isPending || query.isRefetching}
            />
            <Button
              title="Aceitar"
              style={styles.actionButton}
              onPress={() => answer.mutate('accepted')}
              loading={answer.isPending && answer.variables === 'accepted'}
              disabled={answer.isPending || query.isRefetching}
            />
          </View>
        ) : displayStatus === 'accepted' ? (
          <>
            {contactWarning ? (
              <Text variant="caption" color="warning" style={styles.contactWarning}>
                {contactWarning}
              </Text>
            ) : null}
            <Button
              title="Conversar no WhatsApp"
              onPress={handleWhatsApp}
              loading={contact.isPending}
              disabled={!contact.data || contact.isPending || answer.isPending}
            />
          </>
        ) : (
          <Button
            title="Voltar às solicitações"
            onPress={() => router.back()}
            disabled={answer.isPending}
          />
        )}
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
  name: {
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
  deadline: {
    textAlign: 'center',
  },
  footer: {
    gap: spacing.sm,
    padding: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  contactWarning: {
    textAlign: 'center',
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  stateText: {
    textAlign: 'center',
  },
});
