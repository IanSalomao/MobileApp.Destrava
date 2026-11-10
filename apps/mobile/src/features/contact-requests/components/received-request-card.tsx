import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { SCHOOL_GRADE_SHORT_LABELS, TUTORING_TYPE_LABELS } from '@/features/catalog/types';
import { formatRelativeTime } from '@/lib/relative-time';
import { colors, radius, spacing } from '@/theme';

import type { ReceivedContactRequest } from '../types';

export type ReceivedRequestCardProps = {
  request: ReceivedContactRequest;
  isNew?: boolean;
  onPress: () => void;
  testID?: string;
};

const TUTORING_ICONS: Record<
  NonNullable<ReceivedContactRequest['preferredTutoringType']>,
  ComponentProps<typeof Ionicons>['name']
> = {
  online: 'globe-outline',
  in_person: 'people-outline',
};

export function ReceivedRequestCard({
  request,
  isNew = false,
  onPress,
  testID,
}: ReceivedRequestCardProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Pedido de ${request.guardianName} para ${request.studentName}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.headerRow}>
        <Avatar name={request.guardianName} imageUrl={request.guardianAvatarUrl} size="lg" />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text variant="label" numberOfLines={1} style={styles.name}>
              {request.guardianName}
            </Text>
            {isNew ? (
              <View testID="received-request-new-badge" style={styles.newBadge}>
                <Text variant="small" color="primary">
                  Novo
                </Text>
              </View>
            ) : null}
          </View>
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            Para {request.studentName} · {SCHOOL_GRADE_SHORT_LABELS[request.schoolGrade]}
          </Text>
        </View>
      </View>

      <Text variant="caption" color="textSecondary" numberOfLines={2}>
        “{request.reason.trim()}”
      </Text>

      <View style={styles.footerRow}>
        {request.preferredTutoringType ? (
          <View style={styles.tutoringChip}>
            <Ionicons
              name={TUTORING_ICONS[request.preferredTutoringType]}
              size={14}
              color={colors.primary}
            />
            <Text variant="small" color="primary">
              {TUTORING_TYPE_LABELS[request.preferredTutoringType]}
            </Text>
          </View>
        ) : (
          <View />
        )}

        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text variant="caption" color="textMuted">
            {formatRelativeTime(request.createdAt)}
          </Text>
        </View>
      </View>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    flexShrink: 1,
  },
  newBadge: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tutoringChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
