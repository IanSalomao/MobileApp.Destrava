import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { FormTextField } from '@/components/form/form-text-field';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { getAuthErrorMessage } from '@/features/auth/errors';
import { useSignOut } from '@/features/auth/hooks';
import { AccountHeader } from '@/features/profile/components/account-header';
import {
  useChangeMyAvatar,
  useGuardianAccount,
  useGuardianAccountForm,
} from '@/features/profile/hooks';
import type { GuardianAccountInput } from '@/features/profile/schemas';
import type { Profile } from '@/features/profile/types';
import { SettingsRow } from '@/features/settings/components/settings-row';
import { StudentCard } from '@/features/students/components/student-card';
import { NEW_STUDENT_ID } from '@/features/students/student-form/domain';
import { maskPhoneBR } from '@/lib/masks';
import { colors, spacing } from '@/theme';

type Account = ReturnType<typeof useGuardianAccount>;

// Conteúdo do perfil depois que nome e celular carregaram: o formulário começa com esses valores.
function GuardianAccountContent({
  account,
  profile,
  initialValues,
}: {
  account: Account;
  profile: Profile;
  initialValues: GuardianAccountInput;
}) {
  const form = useGuardianAccountForm(initialValues);
  const avatar = useChangeMyAvatar();
  const signOut = useSignOut();

  return (
    <Screen>
      <AccountHeader
        fullName={profile.full_name}
        subtitle={account.subtitle}
        avatarUrl={profile.avatar_url}
        isUploading={avatar.isUploading}
        onChangePhoto={() => void avatar.pickAndUpload()}
      />
      {avatar.errorMessage ? (
        <Text accessibilityRole="alert" variant="caption" color="danger">
          {avatar.errorMessage}
        </Text>
      ) : null}

      <View style={styles.section}>
        <Text variant="subtitle">Seus dados</Text>
        <FormTextField
          control={form.control}
          name="fullName"
          label="Nome completo"
          placeholder="Seu nome"
          leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
          autoComplete="name"
          textContentType="name"
        />
        <TextField
          label="E-mail"
          value={account.email}
          editable={false}
          leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
          rightIcon={<Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />}
          helperText="O e-mail de acesso não pode ser alterado por aqui."
        />
        <FormTextField
          control={form.control}
          name="phone"
          label="Celular"
          placeholder="(00) 00000-0000"
          leftIcon={<Ionicons name="call-outline" size={20} color={colors.textMuted} />}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maskFormatter={maskPhoneBR}
        />
      </View>

      <View style={styles.section}>
        <Text variant="subtitle">{account.students.length > 1 ? 'Alunos' : 'Aluno'}</Text>
        {account.isLoadingStudents ? (
          <ActivityIndicator color={colors.primary} />
        ) : account.studentsFailed ? (
          <View style={styles.inlineState}>
            <Text color="danger">Não foi possível carregar seus alunos.</Text>
            <Button title="Tentar de novo" variant="ghost" onPress={account.retryStudents} />
          </View>
        ) : account.students.length === 0 ? (
          <Text color="textMuted">Cadastre seu filho para pedir contato com os professores.</Text>
        ) : (
          account.students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onPress={() =>
                router.push({ pathname: '/students/[id]', params: { id: student.id } })
              }
            />
          ))
        )}
        <Button
          title="Cadastrar aluno"
          variant="secondary"
          leftIcon={<Ionicons name="add" size={20} color={colors.primary} />}
          onPress={() =>
            router.push({ pathname: '/students/[id]', params: { id: NEW_STUDENT_ID } })
          }
        />
      </View>

      <View style={styles.section}>
        <Text variant="subtitle">Interesses</Text>
        {account.isLoadingInterests ? (
          <ActivityIndicator color={colors.primary} />
        ) : account.interestsFailed ? (
          <Text color="danger">Não foi possível carregar as matérias de interesse.</Text>
        ) : account.interests.length === 0 ? (
          <Text color="textMuted">As matérias de interesse dos seus alunos aparecem aqui.</Text>
        ) : (
          <View style={styles.chips}>
            {account.interests.map((subject) => (
              <Chip key={subject.id} label={subject.name} selected accessibilityRole="text" />
            ))}
          </View>
        )}
      </View>

      {form.errorMessage ? (
        <Text accessibilityRole="alert" color="danger">
          {form.errorMessage}
        </Text>
      ) : null}
      {form.isSaved ? (
        <Text accessibilityRole="alert" color="success">
          Alterações salvas.
        </Text>
      ) : null}
      <Button title="Salvar alterações" loading={form.isSubmitting} onPress={form.submit} />

      <View style={styles.section}>
        <Text variant="subtitle">Conta</Text>
        <SettingsRow title="Favoritos" onPress={() => router.push('/favorites')} />
        <SettingsRow title="Configurações" onPress={() => router.push('/settings')} />
        <SettingsRow
          title="Sair da conta"
          danger
          showChevron={false}
          onPress={() => signOut.mutate()}
        />
        {signOut.error ? (
          <Text variant="caption" color="danger">
            {getAuthErrorMessage(signOut.error)}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

// Meu perfil do responsável: foto, nome, e-mail (só leitura), celular, alunos e matérias de
// interesse, com atalhos para Favoritos, Configurações e Sair. Protótipo: "PERFIL RESPONSAVEL".
export default function GuardianAccountScreen() {
  const account = useGuardianAccount();

  if (account.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator testID="account-loading" color={colors.primary} />
      </View>
    );
  }

  if (account.isError || !account.profile || !account.initialValues) {
    return (
      <View style={styles.center}>
        <Banner
          variant="danger"
          title="Não foi possível carregar seu perfil"
          description="Verifique sua conexão e tente novamente."
        />
        <Button title="Tentar de novo" onPress={account.retry} />
      </View>
    );
  }

  return (
    <GuardianAccountContent
      key={account.profile.id}
      account={account}
      profile={account.profile}
      initialValues={account.initialValues}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  section: {
    gap: spacing.sm,
  },
  inlineState: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
