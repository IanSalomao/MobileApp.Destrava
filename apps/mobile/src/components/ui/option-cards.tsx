import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Text } from './text';

export type OptionCard<T extends string> = {
  value: T;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type OptionCardsProps<T extends string> = {
  options: OptionCard<T>[];
  value: T[];
  onChange: (value: T[]) => void;
};

// Cartões grandes selecionáveis (ex.: tipo de aula Presencial/Online). Multi-seleção: o professor
// pode oferecer os dois.
export function OptionCards<T extends string>({ options, value, onChange }: OptionCardsProps<T>) {
  const toggle = (option: T) => {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  };

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = value.includes(option.value);
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => toggle(option.value)}
            style={[styles.card, selected ? styles.selected : styles.unselected]}
          >
            <Ionicons
              name={option.icon}
              size={28}
              color={selected ? colors.primary : colors.textMuted}
            />
            <Text variant="label" color={selected ? 'primary' : 'text'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
});
