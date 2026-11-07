import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { WeekdayPicker } from '@/components/ui/weekday-picker';
import { spacing } from '@/theme';

type FormWeekdayPickerProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
};

// WeekdayPicker ligado ao react-hook-form. O valor do campo é um array de dias (0 = domingo).
export function FormWeekdayPicker<T extends FieldValues>({
  control,
  name,
  label,
}: FormWeekdayPickerProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name });

  return (
    <View style={styles.container}>
      {label ? <Text variant="label">{label}</Text> : null}
      <WeekdayPicker value={(value as number[] | undefined) ?? []} onChange={onChange} />
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
