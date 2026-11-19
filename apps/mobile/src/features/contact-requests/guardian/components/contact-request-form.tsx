import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet } from 'react-native';

import { FormSelectField } from '@/components/form/form-select-field';
import { FormTextField } from '@/components/form/form-text-field';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { Text } from '@/components/ui/text';
import { SCHOOL_GRADE_LABELS, SCHOOL_GRADE_OPTIONS } from '@/features/catalog/types';
import type { StudentSummary } from '@/features/students/types';
import { colors } from '@/theme';

import { TUTORING_PREFERENCE_OPTIONS } from '../domain';
import { useContactRequestForm } from '../hooks';
import { REASON_MAX_LENGTH } from '../schemas';
import { TeacherSummaryCard } from './teacher-summary-card';

export type ContactRequestFormProps = {
  teacher: { id: string; fullName: string; avatarUrl: string | null };
  guardianName: string;
  students: readonly StudentSummary[];
  /** Chamado depois do envio, com o nome do professor para a tela de confirmação. */
  onSent: (teacherName: string) => void;
};

// Formulário "Solicitar contato" (RF07). Protótipo: "FORMULARIO SOLICIAR CONTATO".
export function ContactRequestForm({
  teacher,
  guardianName,
  students,
  onSent,
}: ContactRequestFormProps) {
  const form = useContactRequestForm({
    teacherId: teacher.id,
    guardianName,
    students,
    onSent: () => onSent(teacher.fullName),
  });

  return (
    <Screen>
      <TeacherSummaryCard name={teacher.fullName} avatarUrl={teacher.avatarUrl} />

      <Banner description="Seu WhatsApp e o do professor só aparecem depois que ele aceitar o pedido." />

      <Text variant="subtitle">Seus dados</Text>
      <FormTextField
        control={form.control}
        name="guardianName"
        label="Seu nome"
        placeholder="Nome do responsável"
        autoCapitalize="words"
        leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
      />

      <Text variant="subtitle">Sobre o aluno</Text>
      {form.hasStudents ? (
        <SelectField
          label="Aluno"
          modalTitle="Aluno"
          options={form.studentOptions}
          value={form.studentChoice}
          onChange={form.onStudentChange}
        />
      ) : null}

      {form.isNewStudent ? (
        <>
          <FormTextField
            control={form.control}
            name="studentName"
            label="Nome do aluno"
            placeholder="Nome de quem vai ter aula"
            autoCapitalize="words"
          />
          <FormSelectField
            control={form.control}
            name="schoolGrade"
            label="Ano escolar"
            placeholder="Selecione o ano escolar"
            modalTitle="Ano escolar"
            options={SCHOOL_GRADE_OPTIONS}
          />
        </>
      ) : form.selectedStudent ? (
        <Text variant="caption" color="textMuted">
          {SCHOOL_GRADE_LABELS[form.selectedStudent.schoolGrade]}
        </Text>
      ) : null}

      <FormTextField
        control={form.control}
        name="studentAge"
        label="Idade do aluno (opcional)"
        placeholder="Ex.: 12"
        keyboardType="number-pad"
        maxLength={2}
      />

      <Text variant="subtitle">Sobre o reforço</Text>
      <FormSelectField
        control={form.control}
        name="tutoringPreference"
        label="Tipo de aula preferido"
        modalTitle="Tipo de aula"
        options={[...TUTORING_PREFERENCE_OPTIONS]}
      />
      <FormTextField
        control={form.control}
        name="reason"
        label="Motivo do reforço"
        placeholder="Ex.: Reforço em frações e preparação para as próximas provas."
        helperText="Conte o que o aluno precisa para o professor entender se pode ajudar."
        multiline
        numberOfLines={5}
        maxLength={REASON_MAX_LENGTH}
        style={styles.textarea}
      />

      {form.errorMessage ? (
        <Banner variant="danger" title="Não foi possível enviar" description={form.errorMessage} />
      ) : null}

      <Button
        title="Enviar solicitação"
        loading={form.isSubmitting}
        onPress={form.submit}
        leftIcon={<Ionicons name="send-outline" size={18} color={colors.onPrimary} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
