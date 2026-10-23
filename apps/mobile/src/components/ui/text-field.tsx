import { useState, type ReactNode, type Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, layout, radius, spacing, typography } from '@/theme';

import { Text } from './text';

export type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  errorMessage?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isPassword?: boolean;
  maskFormatter?: (value: string) => string;
  containerStyle?: StyleProp<ViewStyle>;
  ref?: Ref<TextInput>;
};

export type InputProps = TextFieldProps;

export function TextField({
  label,
  error,
  errorMessage,
  helperText,
  leftIcon,
  rightIcon,
  isPassword = false,
  secureTextEntry,
  maskFormatter,
  onChangeText,
  containerStyle,
  style,
  ref,
  ...rest
}: TextFieldProps) {
  const enablePasswordToggle = Boolean(isPassword || secureTextEntry);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const resolvedError = error ?? errorMessage;
  const shouldHideText = enablePasswordToggle ? !isPasswordVisible : false;

  const handleChangeText = (text: string) => {
    if (!onChangeText) return;
    onChangeText(maskFormatter ? maskFormatter(text) : text);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text variant="label">{label}</Text> : null}

      <View
        style={[
          styles.inputWrapper,
          resolvedError ? styles.inputError : null,
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={shouldHideText}
          onChangeText={handleChangeText}
          style={[styles.input, style]}
          {...rest}
        />

        {enablePasswordToggle ? (
          <Pressable
            testID="password-visibility-toggle"
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'
            }
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            style={styles.passwordToggle}
          >
            <Text variant="caption" color="primary">
              {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
            </Text>
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>

      {resolvedError ? (
        <Text accessibilityRole="alert" variant="caption" color="danger">
          {resolvedError}
        </Text>
      ) : helperText ? (
        <Text variant="caption" color="textMuted">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

export const Input = TextField;

const MIN_TOUCH = layout?.minTouchTarget ?? 44;

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  inputWrapper: {
    minHeight: Math.max(MIN_TOUCH, 48),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  input: {
    ...typography.body,
    flex: 1,
    minHeight: MIN_TOUCH,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  leftIcon: {
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIcon: {
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordToggle: {
    minHeight: MIN_TOUCH,
    minWidth: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: spacing.xs,
  },
  inputError: {
    borderColor: colors.danger,
  },
});
