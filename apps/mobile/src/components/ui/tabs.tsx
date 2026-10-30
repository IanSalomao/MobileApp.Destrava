import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, layout, radius, spacing } from '@/theme';

import { Text } from './text';

export type TabOption<K extends string = string> = {
  key: K;
  label: string;
  badgeCount?: number;
};

export type TabsProps<K extends string = string> = {
  options: TabOption<K>[];
  activeKey: K;
  onChange: (key: K) => void;
  style?: StyleProp<ViewStyle>;
};

export function Tabs<K extends string = string>({
  options,
  activeKey,
  onChange,
  style,
}: TabsProps<K>) {
  return (
    <View accessibilityRole="tablist" style={[styles.container, style]}>
      {options.map((option) => {
        const isSelected = option.key === activeKey;

        return (
          <Pressable
            key={option.key}
            testID={`tab-${option.key}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={
              typeof option.badgeCount === 'number'
                ? `${option.label} (${option.badgeCount})`
                : option.label
            }
            onPress={() => onChange(option.key)}
            style={[
              styles.tabButton,
              isSelected ? styles.tabButtonActive : styles.tabButtonInactive,
            ]}
          >
            <Text variant="label" color={isSelected ? 'onPrimary' : 'text'} numberOfLines={1}>
              {option.label}
              {typeof option.badgeCount === 'number' ? ` (${option.badgeCount})` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const minTouch = Math.max(layout?.minTouchTarget ?? 44, 44);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tabButton: {
    flex: 1,
    minHeight: minTouch,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
