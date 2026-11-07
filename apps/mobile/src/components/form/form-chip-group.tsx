import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { Text } from '@/components/ui/text';
import { spacing } from '@/theme';

type Option = { value: string; label: string };

type FormChipGroupProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  options: Option[];
  label?: string;
};

// Grupo de chips de múltipla escolha ligado ao react-hook-form (matérias, idiomas, períodos).
// O valor do campo é um array de ids/valores selecionados.
export function FormChipGroup<T extends FieldValues>({
  control,
  name,
  options,
  label,
}: FormChipGroupProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name });

  const selected = (value as string[] | undefined) ?? [];
  const toggle = (optionValue: string) => {
    onChange(
      selected.includes(optionValue)
        ? selected.filter((item) => item !== optionValue)
        : [...selected, optionValue],
    );
  };

  return (
    <View style={styles.container}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View style={styles.chips}>
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={selected.includes(option.value)}
            onPress={() => toggle(option.value)}
          />
        ))}
      </View>
      {error ? (
        <Text accessibilityRole="alert" variant="caption" color="danger">
          {error.message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
