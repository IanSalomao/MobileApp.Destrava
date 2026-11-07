import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { FormTextField } from '@/components/form/form-text-field';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { StepHeader } from '@/components/ui/step-header';
import { Text } from '@/components/ui/text';
import { TermsConsentFields } from '@/features/auth/components/terms-consent-fields';
import { useSignUpForm } from '@/features/auth/hooks';
import { MIN_PASSWORD_LENGTH, parseRoleParam } from '@/features/auth/schemas';
import { maskPhoneBR } from '@/lib/masks';
import { colors, spacing } from '@/theme';

export default function SignUpScreen() {
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role = parseRoleParam(roleParam);

  const { control, submit, isSubmitting, errorMessage, needsEmailConfirmation } = useSignUpForm(
    role,
    (signedInRole) =>
      router.replace(signedInRole === 'teacher' ? '/teacher-subscription' : '/guardian-profile'),
  );

  // Sem papel não dá para montar o cadastro certo: volta à escolha de perfil.
  if (!role) return <Redirect href="/welcome" />;

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

  const copy = role === 'teacher' ? TEACHER_COPY : GUARDIAN_COPY;

  return (
    <Screen>
      {role === 'teacher' ? (
        <StepHeader eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
      ) : (
        <StepHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          subtitle={copy.subtitle}
          step={1}
          totalSteps={2}
        />
      )}

      <FormTextField
        control={control}
        name="fullName"
        label="Nome completo"
        placeholder={role === 'teacher' ? 'Como podemos te chamar?' : 'Seu nome'}
        leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
        autoComplete="name"
        textContentType="name"
      />
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
      />
      <FormTextField
        control={control}
        name="phone"
        label="Celular"
        placeholder="(00) 00000-0000"
        leftIcon={<Ionicons name="call-outline" size={20} color={colors.textMuted} />}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        maskFormatter={maskPhoneBR}
      />
      <FormTextField
        control={control}
        name="password"
        label="Senha"
        placeholder={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`}
        leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
        autoComplete="new-password"
        textContentType="newPassword"
        secureTextEntry
      />

      <TermsConsentFields control={control} />

      {errorMessage ? <Text color="danger">{errorMessage}</Text> : null}

      <Button title={copy.submit} loading={isSubmitting} onPress={submit} />

      {role === 'teacher' ? (
        <View style={styles.secureNote}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
          <Text variant="caption" color="textMuted">
            Seus dados estão protegidos.
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

const GUARDIAN_COPY: Record<'eyebrow' | 'title' | 'subtitle' | 'submit', string> = {
  eyebrow: 'Responsável • Etapa 1 de 2',
  title: 'Crie sua conta gratuita',
  subtitle:
    'Responsáveis não pagam assinatura. Sua conta permite solicitar contato e conversar com professores.',
  submit: 'Continuar',
};

const TEACHER_COPY: Record<'eyebrow' | 'title' | 'subtitle' | 'submit', string> = {
  eyebrow: 'Perfil professor',
  title: 'Comece sua jornada',
  subtitle: 'Crie sua conta para divulgar suas aulas e receber solicitações.',
  submit: 'Criar conta',
};

const styles = StyleSheet.create({
  secureNote: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
