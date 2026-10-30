import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Avatar } from './avatar';
import { Rating } from './rating';
import { Text } from './text';

export type TeacherCardProps = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  isVerified?: boolean;
  subjects: string[];
  hourlyRateCents: number;
  ratingAverage: number;
  ratingCount?: number;
  distanceLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function formatHourlyRate(cents: number): string {
  const reais = Math.round(cents / 100);
  return `R$ ${reais}/h`;
}

export function TeacherCard({
  id,
  name,
  avatarUrl,
  isVerified = false,
  subjects,
  hourlyRateCents,
  ratingAverage,
  ratingCount,
  distanceLabel,
  onPress,
  style,
}: TeacherCardProps) {
  return (
    <Pressable
      testID={`teacher-card-${id}`}
      accessibilityRole={onPress ? 'button' : 'summary'}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress ? styles.cardPressed : null, style]}
    >
      <View style={styles.headerRow}>
        <Avatar name={name} imageUrl={avatarUrl} size="md" />

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text variant="subtitle" numberOfLines={1} style={styles.nameText}>
              {name}
            </Text>
            {isVerified ? (
              <View testID="teacher-verified-badge" style={styles.verifiedBadge}>
                <Text variant="caption" color="primary">
                  Verificado
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <Rating value={ratingAverage} reviewCount={ratingCount} readOnly />
            {distanceLabel ? (
              <>
                <Text variant="caption" color="textMuted">
                  •
                </Text>
                <Text variant="caption" color="textMuted">
                  {distanceLabel}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.priceSlot}>
          <Text variant="label" color="primary">
            {formatHourlyRate(hourlyRateCents)}
          </Text>
        </View>
      </View>

      {subjects.length > 0 ? (
        <View style={styles.subjectsRow}>
          {subjects.map((subject) => (
            <View key={subject} style={styles.subjectChip}>
              <Text variant="caption" color="primary">
                {subject}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardPressed: {
    opacity: 0.92,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  nameText: {
    flexShrink: 1,
  },
  verifiedBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  priceSlot: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  subjectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  subjectChip: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
