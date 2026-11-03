import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors, radius, spacing } from '@/theme';

const BOX_SIZE = spacing.lg;

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Texto do rótulo. Pode conter trechos clicáveis (links) aninhados em <Text>. */
  children: ReactNode;
  error?: string;
  /** Rótulo lido por leitores de tela, já que o conteúdo pode ter links. */
  accessibilityLabel: string;
};

export function Checkbox({
  checked,
  onChange,
  children,
  error,
  accessibilityLabel,
}: CheckboxProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ checked }}
        onPress={() => onChange(!checked)}
        style={styles.row}
      >
        <View style={[styles.box, checked && styles.boxChecked, !!error && styles.boxError]}>
          {checked ? (
            <Ionicons name="checkmark" size={BOX_SIZE - spacing.xs} color={colors.onPrimary} />
          ) : null}
        </View>
        <Text variant="caption" color="textSecondary" style={styles.label}>
          {children}
        </Text>
      </Pressable>
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  boxChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  boxError: {
    borderColor: colors.danger,
  },
  label: {
    flex: 1,
  },
});
