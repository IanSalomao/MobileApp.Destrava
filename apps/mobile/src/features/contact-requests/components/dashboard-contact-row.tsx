import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { colors, radius, spacing } from '@/theme';

export type DashboardContactRowProps = {
  name: string;
  avatarUrl?: string | null;
  subtitle: string;
  timeLabel: string;
  onPress: () => void;
  testID?: string;
};

// Linha das listas "Últimos contatos" e "Últimas solicitações" do início do professor.
export function DashboardContactRow({
  name,
  avatarUrl,
  subtitle,
  timeLabel,
  onPress,
  testID,
}: DashboardContactRowProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${subtitle}, ${timeLabel}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Avatar name={name} imageUrl={avatarUrl} size="md" />

      <View style={styles.info}>
        <Text variant="label" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="caption" color="textMuted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.meta}>
        <Text variant="caption" color="textMuted">
          {timeLabel}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  rowPressed: {
    opacity: 0.92,
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
