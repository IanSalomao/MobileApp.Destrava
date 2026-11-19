import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { ReviewForm } from '@/features/reviews/components/review-form';
import { useMyReview, useReviewForm } from '@/features/reviews/hooks';
import type { Review } from '@/features/reviews/types';
import { usePublicTeacherProfile } from '@/features/teachers/public-profile/hooks';
import type { PublicTeacherProfile } from '@/features/teachers/public-profile/types';
import { colors, spacing } from '@/theme';

// Formulário da avaliação. Sem `review` cria; com `review` edita a avaliação que já existe.
function ReviewEditor({
  teacher,
  review,
}: {
  teacher: PublicTeacherProfile;
  review: Review | null;
}) {
  const vm = useReviewForm(teacher.id, review, () => router.back());

  return (
    <>
      <Stack.Screen options={{ title: vm.isEditing ? 'Editar avaliação' : 'Avaliar professor' }} />
      <Screen>
        <ReviewForm
          teacherName={teacher.fullName}
          teacherAvatarUrl={teacher.avatarUrl}
          isEditing={vm.isEditing}
          control={vm.control}
          rating={vm.rating}
          ratingLabel={vm.ratingLabel}
          ratingError={vm.ratingError}
          commentLength={vm.commentLength}
          onChangeRating={vm.setRating}
          hadClass={vm.hadClass}
          onChangeHadClass={vm.setHadClass}
          canSubmit={vm.canSubmit}
          isSubmitting={vm.isSubmitting}
          errorMessage={vm.errorMessage}
          onSubmit={vm.submit}
        />
      </Screen>
    </>
  );
}

// Avaliação do professor: nota de 1 a 5 obrigatória e comentário opcional, liberada para quem
// teve uma solicitação aceita com ele (RF12; o RLS garante). Uma avaliação por par, editável: se
// o responsável já avaliou, a tela abre com a avaliação dele para editar. Protótipo: "AVALIAÇÃO".
export default function WriteReviewScreen() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();
  const teacher = usePublicTeacherProfile(teacherId);
  const myReview = useMyReview(teacherId);

  if (teacher.isPending || myReview.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator testID="write-review-loading" color={colors.primary} />
      </View>
    );
  }

  if (teacher.isError || myReview.isError) {
    return (
      <View style={styles.center}>
        <Banner
          variant="danger"
          title="Não foi possível carregar"
          description={myReview.errorMessage ?? 'Verifique sua conexão e tente novamente.'}
        />
        <Button
          title="Tentar de novo"
          onPress={() => {
            if (teacher.isError) void teacher.refetch();
            if (myReview.isError) void myReview.refetch();
          }}
        />
      </View>
    );
  }

  if (!teacher.data) {
    return (
      <View style={styles.center}>
        <Text variant="subtitle" style={styles.centerText}>
          Professor não encontrado
        </Text>
        <Text color="textSecondary" style={styles.centerText}>
          Este perfil não está disponível no momento.
        </Text>
        <Button title="Voltar" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const review = myReview.data ?? null;
  return <ReviewEditor key={review?.id ?? 'new'} teacher={teacher.data} review={review} />;
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
