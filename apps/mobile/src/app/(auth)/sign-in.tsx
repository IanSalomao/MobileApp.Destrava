import { router } from 'expo-router';

import { FormTextField } from '@/components/form/form-text-field';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { useSignInForm } from '@/features/auth/hooks';

export default function SignInScreen() {
  const { control, submit, isSubmitting, errorMessage } = useSignInForm();

  return (
    <Screen>
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
        autoComplete="current-password"
        textContentType="password"
        secureTextEntry
        onSubmitEditing={submit}
      />

      {errorMessage ? <Text color="danger">{errorMessage}</Text> : null}

      <Button title="Entrar" loading={isSubmitting} onPress={submit} />
      <Button
        title="Ainda não tenho conta"
        variant="ghost"
        onPress={() => router.replace('/sign-up')}
      />
    </Screen>
  );
}
