import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

import { SelectField, type SelectOption } from '@/components/ui/select-field';

type FormSelectFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  options: SelectOption<string | number>[];
  label?: string;
  placeholder?: string;
  modalTitle?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
};

// SelectField ligado ao react-hook-form (ex.: ano escolar, estado, cidade).
export function FormSelectField<T extends FieldValues>({
  control,
  name,
  options,
  label,
  placeholder,
  modalTitle,
  searchable,
  searchPlaceholder,
  disabled,
}: FormSelectFieldProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name });

  return (
    <SelectField
      label={label}
      placeholder={placeholder}
      modalTitle={modalTitle}
      options={options}
      value={(value as string | number | undefined) ?? null}
      onChange={onChange}
      error={error?.message}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      disabled={disabled}
    />
  );
}
