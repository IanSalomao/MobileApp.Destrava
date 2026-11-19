import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { useSubjects } from '@/features/catalog/hooks';
import { StudentForm } from '@/features/students/student-form/components/student-form';
import { parseStudentRoute } from '@/features/students/student-form/domain';
import { useStudent, useStudentForm } from '@/features/students/student-form/hooks';
import type { StudentDetail } from '@/features/students/student-form/types';
import { colors, spacing } from '@/theme';

function StateMessage({ message }: { message: string }) {
  return (
    <View style={styles.state}>
      <Text variant="subtitle" color="danger" style={styles.centered}>
        Não foi possível abrir o aluno
      </Text>
      <Text color="textMuted" style={styles.centered}>
        {message}
      </Text>
      <Button title="Voltar" variant="secondary" onPress={() => router.back()} />
    </View>
  );
}

// Formulário do aluno. Sem `student` cadastra um aluno novo; com `student` edita o existente.
function StudentEditor({ student }: { student?: StudentDetail }) {
  const subjects = useSubjects();
  const { isEditing, control, submit, isSubmitting, errorMessage } = useStudentForm(student, () =>
    router.back(),
  );

  const subjectOptions = (subjects.data ?? []).map((subject) => ({
    value: subject.id,
    label: subject.name,
  }));

  return (
    <>
      <Stack.Screen options={{ title: isEditing ? 'Editar aluno' : 'Novo aluno' }} />
      <Screen>
        <StudentForm
          control={control}
          subjectOptions={subjectOptions}
          subjectsFailed={subjects.isError}
          submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar aluno'}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onRetrySubjects={() => void subjects.refetch()}
          onSubmit={submit}
        />
      </Screen>
    </>
  );
}

// Cadastro e edição de um aluno (filho) do responsável: nome, ano escolar e matérias. O id "new"
// cadastra; um id de aluno edita. Dados de menor: só o próprio responsável lê (LGPD).
// Protótipo: card "Aluno" do PERFIL RESPONSAVEL.
export default function StudentScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const route = parseStudentRoute(params.id);
  const query = useStudent(route.mode === 'edit' ? route.studentId : undefined);

  if (route.mode === 'new') return <StudentEditor />;
  if (route.mode === 'invalid') return <StateMessage message="Aluno não encontrado." />;

  if (query.isPending) {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text color="textMuted">Carregando...</Text>
      </View>
    );
  }

  if (query.isError || !query.data) {
    return <StateMessage message={query.errorMessage ?? 'Não foi possível carregar o aluno.'} />;
  }

  return <StudentEditor key={query.data.id} student={query.data} />;
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  centered: {
    textAlign: 'center',
  },
});
