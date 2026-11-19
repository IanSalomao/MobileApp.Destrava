import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ContactRequestForm } from '@/features/contact-requests/guardian/components/contact-request-form';
import { useMyProfile } from '@/features/profile/hooks';
import { useMyStudents } from '@/features/students/hooks';
import { usePublicTeacherProfile } from '@/features/teachers/public-profile/hooks';
import { colors, spacing } from '@/theme';

// Formulário de solicitação de contato: dados do responsável, do aluno e motivo do reforço (RF07).
// Protótipo: "FORMULARIO SOLICIAR CONTATO". Depois do envio segue para /contact-request-sent.
export default function ContactRequestFormScreen() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();
  const teacher = usePublicTeacherProfile(teacherId);
  const profile = useMyProfile();
  const students = useMyStudents();

  if (teacher.isPending || profile.isPending || students.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator testID="contact-request-loading" color={colors.primary} />
      </View>
    );
  }

  if (teacher.isError || profile.isError || students.isError) {
    return (
      <View style={styles.center}>
        <Banner
          variant="danger"
          title="Não foi possível carregar"
          description="Verifique sua conexão e tente novamente."
        />
        <Button
          title="Tentar de novo"
          onPress={() => {
            void teacher.refetch();
            void profile.refetch();
            void students.refetch();
          }}
        />
      </View>
    );
  }

  if (!teacher.data) {
    return (
      <View style={styles.center}>
        <Text variant="subtitle">Professor não encontrado</Text>
        <Text color="textSecondary" style={styles.centerText}>
          Este professor não está disponível para contato no momento.
        </Text>
        <Button title="Voltar" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ContactRequestForm
      teacher={{
        id: teacher.data.id,
        fullName: teacher.data.fullName,
        avatarUrl: teacher.data.avatarUrl,
      }}
      guardianName={profile.data.full_name}
      students={students.data}
      // replace: o formulário não deve ficar na pilha, para o voltar não reenviar o pedido.
      onSent={(teacherName) =>
        router.replace({ pathname: '/contact-request-sent', params: { teacherName } })
      }
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
  centerText: {
    textAlign: 'center',
  },
});
