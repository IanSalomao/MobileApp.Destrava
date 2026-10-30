import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, layout, spacing } from '@/theme';

import { Text } from './text';

export type RatingProps = {
  value: number;
  maxStars?: number;
  reviewCount?: number;
  readOnly?: boolean;
  onChange?: (newValue: number) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Rating({
  value,
  maxStars = 5,
  reviewCount,
  readOnly = false,
  onChange,
  style,
  testID,
}: RatingProps) {
  const isInteractive = !readOnly && typeof onChange === 'function';

  if (!isInteractive) {
    return (
      <View
        testID={testID}
        accessibilityRole="text"
        accessibilityLabel={`Nota ${value.toFixed(1)} de ${maxStars}`}
        style={[styles.readOnlyContainer, style]}
      >
        <Text variant="label" style={styles.starIcon}>
          ★
        </Text>
        <Text variant="label">{value.toFixed(1)}</Text>
        {typeof reviewCount === 'number' ? (
          <Text variant="caption" color="textMuted">
            ({reviewCount})
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View
      testID={testID}
      accessibilityRole="adjustable"
      style={[styles.interactiveContainer, style]}
    >
      {Array.from({ length: maxStars }, (_, index) => {
        const starNumber = index + 1;
        const filled = starNumber <= Math.round(value);

        return (
          <Pressable
            key={starNumber}
            testID={`rating-star-${starNumber}`}
            accessibilityRole="button"
            accessibilityLabel={`${starNumber} ${starNumber === 1 ? 'estrela' : 'estrelas'}`}
            accessibilityState={{ selected: filled }}
            onPress={() => onChange(starNumber)}
            style={styles.starButton}
          >
            <Text variant="subtitle" style={filled ? styles.starFilled : styles.starEmpty}>
              {filled ? '★' : '☆'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const minTouch = Math.max(layout?.minTouchTarget ?? 44, 44);

const styles = StyleSheet.create({
  readOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  interactiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  starButton: {
    minWidth: minTouch,
    minHeight: minTouch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    color: colors.primary,
  },
  starFilled: {
    color: colors.primary,
  },
  starEmpty: {
    color: colors.textMuted,
  },
});
