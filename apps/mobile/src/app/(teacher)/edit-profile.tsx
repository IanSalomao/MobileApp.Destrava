import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { TeacherProfileForm } from '@/features/teachers/components/teacher-profile-form';
import { useTeacherProfileForm } from '@/features/teachers/hooks';
import { colors, spacing } from '@/theme';

// Edição do perfil profissional depois do onboarding: dados, matérias, idiomas, disponibilidade,
// valor, cidade e link de rede social (RF01, RF11). Mesmo formulário de 3 etapas do onboarding,
// pré-preenchido. Com a verificação aprovada, CPF e documento ficam travados.
export default function EditTeacherProfileScreen() {
  const vm = useTeacherProfileForm(() => router.back(), 'edit');

  if (vm.isLoadingSaved) {
    return (
      <View style={styles.center}>
        <ActivityIndicator testID="edit-profile-loading" color={colors.primary} />
      </View>
    );
  }

  if (vm.loadError) {
    return (
      <View style={styles.center}>
        <Banner
          variant="danger"
          title="Não foi possível carregar seu perfil"
          description="Verifique sua conexão e tente novamente."
        />
        <Button title="Tentar de novo" onPress={vm.retryLoad} />
      </View>
    );
  }

  return <TeacherProfileForm vm={vm} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
});
