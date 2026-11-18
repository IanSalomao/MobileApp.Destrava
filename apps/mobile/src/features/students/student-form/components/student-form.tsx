import Ionicons from '@expo/vector-icons/Ionicons';
import type { Control } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormChipGroup } from '@/components/form/form-chip-group';
import { FormSelectField } from '@/components/form/form-select-field';
import { FormTextField } from '@/components/form/form-text-field';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { SCHOOL_GRADE_OPTIONS } from '@/features/catalog/types';
import { colors, spacing } from '@/theme';

import type { StudentProfileInput } from '../../schemas';

export type StudentFormProps = {
  control: Control<StudentProfileInput>;
  subjectOptions: { value: string; label: string }[];
  /** As matérias do catálogo não carregaram: sem elas não dá para salvar, então oferece recarregar. */
  subjectsFailed: boolean;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onRetrySubjects: () => void;
  onSubmit: () => void;
};

// Campos do aluno (cadastro e edição): nome, ano escolar, matérias de interesse e objetivo.
// Protótipo: card "Aluno" do PERFIL RESPONSAVEL.
export function StudentForm({
  control,
  subjectOptions,
  subjectsFailed,
  submitLabel,
  isSubmitting,
  errorMessage,
  onRetrySubjects,
  onSubmit,
}: StudentFormProps) {
  return (
    <>
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

      {subjectsFailed ? (
        <View style={styles.subjectsError}>
          <Text color="danger">Não foi possível carregar as matérias.</Text>
          <Button title="Tentar novamente" variant="secondary" onPress={onRetrySubjects} />
        </View>
      ) : (
        <FormChipGroup
          control={control}
          name="subjectIds"
          label="Matérias de interesse"
          options={subjectOptions}
        />
      )}

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

      <Button title={submitLabel} loading={isSubmitting} onPress={onSubmit} />
    </>
  );
}

const styles = StyleSheet.create({
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  subjectsError: {
    gap: spacing.sm,
  },
});