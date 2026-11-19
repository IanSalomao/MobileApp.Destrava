import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { SCHOOL_GRADE_SHORT_LABELS } from '@/features/catalog/types';
import { formatRelativeTime } from '@/lib/relative-time';
import { colors, radius, spacing } from '@/theme';

import type { ContactRequestStatus } from '../../../domain/contact-request';
import type { MyContactRequest } from '../types';
import { MyRequestStatusPill } from './my-request-status-pill';
import { WhatsAppButton } from './whatsapp-button';

export type MyRequestCardProps = {
  request: MyContactRequest;
  /** Status exibido (pendente com prazo vencido aparece como expirada). */
  status: ContactRequestStatus;
  onPress: () => void;
  /** Só aparece nas aceitas que já têm o número do professor liberado. */
  onOpenWhatsApp?: () => void;
  testID?: string;
};

// Card da lista "Minhas solicitações" (RF14).
export function MyRequestCard({
  request,
  status,
  onPress,
  onOpenWhatsApp,
  testID,
}: MyRequestCardProps) {
  const showWhatsApp = status === 'accepted' && Boolean(request.teacherPhone) && onOpenWhatsApp;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Pedido para ${request.teacherName}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.headerRow}>
        <Avatar name={request.teacherName} imageUrl={request.teacherAvatarUrl} size="lg" />

        <View style={styles.info}>
          <Text variant="label" numberOfLines={1}>
            {request.teacherName}
          </Text>
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            Para {request.studentName} · {SCHOOL_GRADE_SHORT_LABELS[request.schoolGrade]}
          </Text>
        </View>
      </View>

      <Text variant="caption" color="textSecondary" numberOfLines={2}>
        “{request.reason.trim()}”
      </Text>

      <View style={styles.footerRow}>
        <MyRequestStatusPill status={status} />

        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text variant="caption" color="textMuted">
            {formatRelativeTime(request.createdAt)}
          </Text>
        </View>
      </View>

      {showWhatsApp ? <WhatsAppButton onPress={onOpenWhatsApp} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.92,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
