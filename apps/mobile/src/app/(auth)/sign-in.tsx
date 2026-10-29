import { router } from 'expo-router';

import { FormTextField } from '@/components/form/form-text-field';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import type { AuthRepository } from '@/features/auth/api';
import { useSignInForm } from '@/features/auth/hooks';

export type SignInScreenProps = {
  repository?: AuthRepository;
};

export default function SignInScreen({ repository }: SignInScreenProps = {}) {
  const { control, submit, isSubmitting, errorMessage } = useSignInForm(repository);

  return (
    <Screen>
      <Text variant="title">Entre na sua conta</Text>
      <Text color="textMuted">Informe seu e-mail e senha para acessar o Destrava.</Text>

      <FormTextField
        control={control}
        name="email"
        label="E-mail"
        placeholder="voce@email.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        editable={!isSubmitting}
      />
      <FormTextField
        control={control}
        name="password"
        label="Senha"
        placeholder="Sua senha"
        autoComplete="current-password"
        textContentType="password"
        secureTextEntry
        editable={!isSubmitting}
        onSubmitEditing={submit}
      />

      {errorMessage ? (
        <Text accessibilityRole="alert" color="danger">
          {errorMessage}
        </Text>
      ) : null}

      <Button title="Entrar" loading={isSubmitting} onPress={submit} />
      <Button
        title="Ainda não tenho conta"
        variant="ghost"
        disabled={isSubmitting}
        onPress={() => router.replace('/sign-up')}
      />
    </Screen>
  );
}
