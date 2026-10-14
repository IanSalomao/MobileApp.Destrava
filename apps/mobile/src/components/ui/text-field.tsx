import type { Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { Text } from './text';

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  ref?: Ref<TextInput>;
};

export function TextField({ label, error, style, ref, ...rest }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text variant="label">{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
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
  input: {
    ...typography.body,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
  },
});
