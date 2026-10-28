import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors, radius, spacing, type ColorToken } from '@/theme';

import { Text } from './text';

export type BannerVariant = 'info' | 'success' | 'warning' | 'danger';

export type BannerProps = ViewProps & {
  title?: string;
  description: string;
  variant?: BannerVariant;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Banner({
  title = 'Contato seguro',
  description,
  variant = 'info',
  icon,
  style,
  ...rest
}: BannerProps) {
  const palette = BANNER_PALETTE[variant];

  return (
    <View
      accessibilityRole="summary"
      style={[
        styles.container,
        {
          backgroundColor: colors[palette.background],
          borderColor: colors[palette.border],
        },
        style,
      ]}
      {...rest}
    >
      {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
      <View style={styles.content}>
        <Text variant="label" color={palette.title}>
          {title}
        </Text>
        <Text variant="caption" color={palette.description}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const BANNER_PALETTE: Record<
  BannerVariant,
  {
    background: ColorToken;
    border: ColorToken;
    title: ColorToken;
    description: ColorToken;
  }
> = {
  info: {
    background: 'infoSoft' in colors ? ('infoSoft' as ColorToken) : 'accentSoft',
    border: 'infoBorder' in colors ? ('infoBorder' as ColorToken) : 'primary',
    title: 'info' in colors ? ('info' as ColorToken) : 'primary',
    description: 'text',
  },
  success: {
    background: 'accentSoft',
    border: 'success',
    title: 'success',
    description: 'text',
  },
  warning: {
    background: 'warningSoft' in colors ? ('warningSoft' as ColorToken) : 'background',
    border: 'warning' in colors ? ('warning' as ColorToken) : 'accent',
    title: 'text',
    description: 'textMuted',
  },
  danger: {
    background: 'dangerSoft' in colors ? ('dangerSoft' as ColorToken) : 'background',
    border: 'danger',
    title: 'danger',
    description: 'text',
  },
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  iconSlot: {
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
});
