import { router } from 'expo-router';

import { FormTextField } from '@/components/form/form-text-field';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import type { AuthRepository } from '@/features/auth/api';
import { useForgotPasswordForm } from '@/features/auth/hooks';
import { Banner } from '@/components/ui/banner';

export type ForgotPasswordScreenProps = {
  repository?: AuthRepository;
};

export default function ForgotPasswordScreen({ repository }: ForgotPasswordScreenProps = {}) {
  const { control, submit, isSubmitting, confirmationMessage, errorMessage } =
    useForgotPasswordForm(repository);

  if (confirmationMessage) {
    return (
      <Screen>
        <Banner variant="success" title="Verifique seu e-mail" description={confirmationMessage} />
        <Button title="Voltar ao login" onPress={() => router.replace('/sign-in')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text variant="title">Esqueci minha senha</Text>
      <Text color="textMuted">
        Informe o e-mail da sua conta para receber o link de redefinição.
      </Text>

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
        onSubmitEditing={submit}
      />

      {errorMessage ? (
        <Text accessibilityRole="alert" color="danger">
          {errorMessage}
        </Text>
      ) : null}

      <Button title="Enviar link" loading={isSubmitting} onPress={submit} />
      <Button
        title="Voltar ao login"
        variant="ghost"
        disabled={isSubmitting}
        onPress={() => router.back()}
      />
    </Screen>
  );
}
