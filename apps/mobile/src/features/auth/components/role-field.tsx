import { Pressable, StyleSheet, View } from 'react-native';
import { useController, type Control } from 'react-hook-form';

import { Text } from '@/components/ui/text';
import { ROLE_LABELS, USER_ROLES } from '@/features/profile/types';
import { colors, radius, spacing } from '@/theme';

import type { SignUpInput } from '../schemas';

const ROLE_HINTS = {
  guardian: 'Quero encontrar reforço escolar',
  teacher: 'Quero divulgar minhas aulas',
} as const;

export function RoleField({ control }: { control: Control<SignUpInput> }) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name: 'role' });

  return (
    <View style={styles.container}>
      <Text variant="label">Você é</Text>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {USER_ROLES.map((role) => {
          const selected = value === role;
          return (
            <Pressable
              key={role}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(role)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text variant="label" color={selected ? 'primary' : 'text'}>
                {ROLE_LABELS[role]}
              </Text>
              <Text variant="caption" color="textMuted">
                {ROLE_HINTS[role]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text variant="caption" color="danger">
          {error.message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.accentSoft,
  },
});
