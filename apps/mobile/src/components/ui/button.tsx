import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Text } from './text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const textColor = variant === 'primary' ? 'onPrimary' : 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        styles[variant],
        state.pressed && styles[`${variant}Pressed`],
        isDisabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors[textColor]} />
      ) : (
        <Text variant="label" color={textColor}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryPressed: {
    backgroundColor: colors.accentSoft,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    backgroundColor: colors.accentSoft,
  },
  disabled: {
    opacity: 0.5,
  },
});
