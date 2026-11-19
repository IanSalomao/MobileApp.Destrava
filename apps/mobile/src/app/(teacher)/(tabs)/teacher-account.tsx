import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { useSignOut } from '@/features/auth/hooks';
import { TeacherAccountView } from '@/features/teachers/components/teacher-account-view';
import { useMyTeacherProfile } from '@/features/teachers/hooks';
import { colors, spacing } from '@/theme';

// Meu perfil do professor: prévia do perfil público, situação na busca e acesso à edição, às
// avaliações recebidas e às configurações (RF01, RF06).
export default function TeacherAccountScreen() {
  const profile = useMyTeacherProfile();
  const signOut = useSignOut();

  if (profile.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator testID="teacher-account-loading" color={colors.primary} />
      </View>
    );
  }

  if (profile.isError) {
    return (
      <View style={styles.center}>
        <Banner
          variant="danger"
          title="Não foi possível carregar seu perfil"
          description="Verifique sua conexão e tente novamente."
        />
        <Button title="Tentar de novo" onPress={() => profile.refetch()} />
        <Button title="Sair da conta" variant="ghost" onPress={() => signOut.mutate()} />
      </View>
    );
  }

  return (
    <TeacherAccountView
      profile={profile.data}
      onEditProfile={() => router.push('/edit-profile')}
      onSeeReviews={() =>
        router.push({ pathname: '/reviews/[teacherId]', params: { teacherId: profile.data.id } })
      }
      onOpenSettings={() => router.push('/settings')}
      onSignOut={() => signOut.mutate()}
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
});
