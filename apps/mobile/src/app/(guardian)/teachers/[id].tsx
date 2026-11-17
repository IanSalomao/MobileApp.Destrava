import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { PublicTeacherProfileView } from '@/features/teachers/public-profile/components/public-teacher-profile-view';
import { usePublicTeacherProfile } from '@/features/teachers/public-profile/hooks';
import { colors, spacing } from '@/theme';

// Perfil público do professor, visto pelo responsável: verificação, nota média e total de
// avaliações, matérias, valor e disponibilidade (RF03, RF06). O estado "depois de aceitar" (rede
// social e WhatsApp, RF09-RF11) entra numa próxima etapa, quando a solicitação de contato existir.
// Protótipos: "DETALHES PROFESSOR", "ANTES DE ACEITAR" e "DEPOIS DE ACEITAR".
export default function TeacherProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = usePublicTeacherProfile(id);

  if (profile.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator testID="teacher-profile-loading" color={colors.primary} />
      </View>
    );
  }

  if (profile.isError) {
    return (
      <View style={styles.center}>
        <Banner
          variant="danger"
          title="Não foi possível carregar"
          description="Verifique sua conexão e tente novamente."
        />
        <Button title="Tentar de novo" onPress={() => profile.refetch()} />
      </View>
    );
  }

  if (!profile.data) {
    return (
      <View style={styles.center}>
        <Text variant="subtitle">Professor não encontrado</Text>
        <Text variant="body" color="textSecondary" style={styles.centerText}>
          Este perfil não está disponível no momento.
        </Text>
        <Button title="Voltar" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <PublicTeacherProfileView
      profile={profile.data}
      onRequestContact={() =>
        router.push({ pathname: '/contact-request/[teacherId]', params: { teacherId: id } })
      }
      onSeeReviews={() =>
        router.push({ pathname: '/reviews/[teacherId]', params: { teacherId: id } })
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
