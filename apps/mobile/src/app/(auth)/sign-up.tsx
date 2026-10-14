import { router } from 'expo-router';

import { FormTextField } from '@/components/form/form-text-field';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { RoleField } from '@/features/auth/components/role-field';
import { useSignUpForm } from '@/features/auth/hooks';
import { MIN_PASSWORD_LENGTH } from '@/features/auth/schemas';

export default function SignUpScreen() {
  const { control, submit, isSubmitting, errorMessage, needsEmailConfirmation } = useSignUpForm();

  if (needsEmailConfirmation) {
    return (
      <Screen>
        <Text variant="subtitle">Confirme seu e-mail</Text>
        <Text color="textMuted">
          Enviamos um link de confirmação. Depois de confirmar, é só entrar com seu e-mail e senha.
        </Text>
        <Button title="Ir para o login" onPress={() => router.replace('/sign-in')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <RoleField control={control} />
      <FormTextField
        control={control}
        name="fullName"
        label="Nome completo"
        autoComplete="name"
        textContentType="name"
      />
      <FormTextField
        control={control}
        name="email"
        label="E-mail"
        placeholder="voce@email.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <FormTextField
        control={control}
        name="password"
        label="Senha"
        placeholder={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`}
        autoComplete="new-password"
        textContentType="newPassword"
        secureTextEntry
        onSubmitEditing={submit}
      />

      {errorMessage ? <Text color="danger">{errorMessage}</Text> : null}

      <Button title="Criar conta" loading={isSubmitting} onPress={submit} />
      <Button title="Já tenho conta" variant="ghost" onPress={() => router.replace('/sign-in')} />
    </Screen>
  );
}
