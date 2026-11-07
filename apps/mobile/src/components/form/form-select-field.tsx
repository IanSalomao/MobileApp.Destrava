import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

import { SelectField, type SelectOption } from '@/components/ui/select-field';

type FormSelectFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  options: SelectOption<string>[];
  label?: string;
  placeholder?: string;
  modalTitle?: string;
};

// SelectField ligado ao react-hook-form (ex.: ano escolar).
export function FormSelectField<T extends FieldValues>({
  control,
  name,
  options,
  label,
  placeholder,
  modalTitle,
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
      value={(value as string | undefined) ?? null}
      onChange={onChange}
      error={error?.message}
    />
  );
}
