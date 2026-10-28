import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, layout, radius, spacing } from '@/theme';

import { Text } from './text';

export type ChipProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  selected?: boolean;
  leftIcon?: ReactNode;
  badgeCount?: number;
  style?: StyleProp<ViewStyle>;
};

export function Chip({
  label,
  selected = false,
  disabled = false,
  leftIcon,
  badgeCount,
  style,
  ...rest
}: ChipProps) {
  const isDisabled = Boolean(disabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled: isDisabled }}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        state.pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {leftIcon ? <View style={styles.iconSlot}>{leftIcon}</View> : null}
      <Text variant="label" color={selected ? 'primary' : 'text'}>
        {label}
      </Text>
      {typeof badgeCount === 'number' ? (
        <View
          style={[styles.badge, { backgroundColor: selected ? colors.primary : colors.border }]}
        >
          <Text variant="caption" color={selected ? 'onPrimary' : 'text'}>
            {badgeCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout?.minTouchTarget ?? 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
