import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { FormTextField } from '@/components/form/form-text-field';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import type { AuthRepository } from '@/features/auth/api';
import { useSignInForm } from '@/features/auth/hooks';
import { colors, spacing } from '@/theme';

export type SignInScreenProps = {
  repository?: AuthRepository;
};

export default function SignInScreen({ repository }: SignInScreenProps = {}) {
  const { control, submit, isSubmitting, errorMessage } = useSignInForm(repository);

  return (
    <Screen edges={['top', 'bottom']}>
      <Logo variant="onLight" />

      <View style={styles.header}>
        <Text variant="small" color="primary" style={styles.eyebrow}>
          QUE BOM TER VOCÊ DE VOLTA
        </Text>
        <Text variant="title">Entre na sua conta</Text>
        <Text color="textMuted">Acesse seus professores, conversas e solicitações.</Text>
      </View>

      <FormTextField
        control={control}
        name="email"
        label="E-mail"
        placeholder="voce@email.com"
        leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
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
        leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
        autoComplete="current-password"
        textContentType="password"
        secureTextEntry
        editable={!isSubmitting}
        onSubmitEditing={submit}
      />

      <Text
        variant="label"
        color="primary"
        style={styles.forgot}
        onPress={() => router.push('/forgot-password')}
      >
        Esqueci minha senha
      </Text>

      {errorMessage ? (
        <Text accessibilityRole="alert" color="danger">
          {errorMessage}
        </Text>
      ) : null}

      <Button title="Entrar" loading={isSubmitting} onPress={submit} />

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <Text color="textMuted">Ainda não tem conta? </Text>
        <Text variant="label" color="primary" onPress={() => router.replace('/welcome')}>
          Criar conta
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  eyebrow: {
    letterSpacing: 1,
  },
  forgot: {
    alignSelf: 'flex-end',
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
