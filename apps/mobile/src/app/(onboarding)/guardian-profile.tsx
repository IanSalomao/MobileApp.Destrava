import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { FormChipGroup } from '@/components/form/form-chip-group';
import { FormSelectField } from '@/components/form/form-select-field';
import { FormTextField } from '@/components/form/form-text-field';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { StepHeader } from '@/components/ui/step-header';
import { Text } from '@/components/ui/text';
import { GUARDIAN_HOME } from '@/features/auth/route-access';
import { useSubjects } from '@/features/catalog/hooks';
import { SCHOOL_GRADE_OPTIONS } from '@/features/catalog/types';
import { useGuardianProfileForm } from '@/features/students/hooks';
import { colors } from '@/theme';

export default function GuardianProfileScreen() {
  const { data: subjects } = useSubjects();
  const { control, submit, isSubmitting, errorMessage } = useGuardianProfileForm(() =>
    router.replace(GUARDIAN_HOME),
  );

  const subjectOptions = (subjects ?? []).map((subject) => ({
    value: subject.id,
    label: subject.name,
  }));

  return (
    <Screen>
      <StepHeader
        eyebrow="Responsável • Etapa 2 de 2"
        title="Configure seu perfil"
        subtitle="Conte para os professores quem precisa de apoio escolar. Você poderá editar tudo depois."
        step={2}
        totalSteps={2}
      />

      <FormTextField
        control={control}
        name="fullName"
        label="Nome do aluno"
        placeholder="Nome de quem vai ter aula"
        leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
      />

      <FormSelectField
        control={control}
        name="schoolGrade"
        label="Ano escolar"
        placeholder="Selecione o ano escolar"
        modalTitle="Ano escolar"
        options={SCHOOL_GRADE_OPTIONS}
      />

      <FormChipGroup
        control={control}
        name="subjectIds"
        label="Matérias de interesse"
        options={subjectOptions}
      />

      <FormTextField
        control={control}
        name="learningGoal"
        label="Objetivo principal"
        placeholder="Ex.: Reforço em frações e preparação para as próximas provas."
        multiline
        numberOfLines={4}
        style={styles.textarea}
      />

      {errorMessage ? <Text color="danger">{errorMessage}</Text> : null}

      <Button
        title="Salvar e encontrar professores"
        loading={isSubmitting}
        onPress={submit}
        leftIcon={<Ionicons name="search" size={18} color={colors.onPrimary} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
