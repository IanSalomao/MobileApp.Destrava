import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { OptionCards, type OptionCard } from '@/components/ui/option-cards';
import { Text } from '@/components/ui/text';
import { spacing } from '@/theme';

type FormOptionCardsProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  options: OptionCard<string>[];
  label?: string;
};

// OptionCards ligado ao react-hook-form (ex.: tipo de aula). Valor do campo é um array de valores.
export function FormOptionCards<T extends FieldValues>({
  control,
  name,
  options,
  label,
}: FormOptionCardsProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name });

  return (
    <View style={styles.container}>
      {label ? <Text variant="label">{label}</Text> : null}
      <OptionCards
        options={options}
        value={(value as string[] | undefined) ?? []}
        onChange={onChange}
      />
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
});
