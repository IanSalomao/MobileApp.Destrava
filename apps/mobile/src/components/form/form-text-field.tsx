import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

import { TextField, type TextFieldProps } from '@/components/ui/text-field';

type FormTextFieldProps<T extends FieldValues> = Omit<
  TextFieldProps,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> & {
  control: Control<T>;
  name: Path<T>;
};

// TextField ligado ao react-hook-form: valor, blur e mensagem de erro vêm do formulário.
export function FormTextField<T extends FieldValues>({
  control,
  name,
  ...rest
}: FormTextFieldProps<T>) {
  // Desestruturado na chamada: com `field.x`, a regra react-hooks/refs trata o objeto inteiro como ref.
  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name });

  return (
    <TextField
      ref={ref}
      value={value ?? ''}
      onChangeText={onChange}
      onBlur={onBlur}
      error={error?.message}
      {...rest}
    />
  );
}
