import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Text } from './text';

// Dias da semana de 0 (domingo) a 6 (sábado), como Date.getDay(). Exibidos de segunda a domingo,
// como no protótipo.
const WEEKDAYS: { value: number; label: string; name: string }[] = [
  { value: 1, label: 'S', name: 'Segunda' },
  { value: 2, label: 'T', name: 'Terça' },
  { value: 3, label: 'Q', name: 'Quarta' },
  { value: 4, label: 'Q', name: 'Quinta' },
  { value: 5, label: 'S', name: 'Sexta' },
  { value: 6, label: 'S', name: 'Sábado' },
  { value: 0, label: 'D', name: 'Domingo' },
];

export type WeekdayPickerProps = {
  value: number[];
  onChange: (value: number[]) => void;
};

export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  const toggle = (day: number) => {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]);
  };

  return (
    <View style={styles.row}>
      {WEEKDAYS.map((day) => {
        const selected = value.includes(day.value);
        return (
          <Pressable
            key={day.value}
            accessibilityRole="button"
            accessibilityLabel={day.name}
            accessibilityState={{ selected }}
            onPress={() => toggle(day.value)}
            style={[styles.circle, selected ? styles.selected : styles.unselected]}
          >
            <Text variant="label" color={selected ? 'onPrimary' : 'textMuted'}>
              {day.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const CIRCLE_SIZE = 44;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
