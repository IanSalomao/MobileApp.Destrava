import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors, radius, spacing } from '@/theme';

export type SettingsRowProps = {
  title: string;
  description?: string;
  onPress: () => void;
  danger?: boolean;
  showChevron?: boolean;
  testID?: string;
};

export function SettingsRow({
  title,
  description,
  onPress,
  danger = false,
  showChevron = true,
  testID,
}: SettingsRowProps) {
  const tint = danger ? colors.danger : colors.textMuted;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.info}>
        <Text variant="label" color={danger ? 'danger' : 'text'}>
          {title}
        </Text>
        {description ? (
          <Text variant="caption" color="textMuted">
            {description}
          </Text>
        ) : null}
      </View>
      {showChevron ? <Ionicons name="chevron-forward" size={18} color={tint} /> : null}
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.92,
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
  },
});
