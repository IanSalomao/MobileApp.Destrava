import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DataList } from '@/components/ui/data-list';
import { ReviewCard } from '@/features/reviews/components/review-card';
import { ReviewSummary } from '@/features/reviews/components/review-summary';
import { useTeacherReviews } from '@/features/reviews/hooks';
import { usePublicTeacherProfile } from '@/features/teachers/public-profile/hooks';
import { colors, spacing } from '@/theme';

// Todas as avaliações de um professor ("Ver todas" no perfil e "Avaliações recebidas" do próprio
// professor) (RF06, RF12). Fica em (shared) porque os dois papéis abrem. Lista paginada, da mais
// recente para a mais antiga; a nota média e o total vêm do banco.
export default function TeacherReviewsScreen() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();
  const profile = usePublicTeacherProfile(teacherId);
  const reviews = useTeacherReviews(teacherId);

  const loadMore = () => {
    if (reviews.hasNextPage && !reviews.isFetchingNextPage) reviews.fetchNextPage();
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <DataList
        data={reviews.reviews}
        keyExtractor={(review) => review.id}
        renderItem={({ item }) => <ReviewCard review={item} />}
        loading={reviews.isPending}
        errorMessage={reviews.errorMessage}
        onRetry={() => reviews.refetch()}
        emptyTitle="Ainda não há avaliações"
        emptyDescription="As avaliações aparecem aqui depois que as famílias avaliarem as aulas."
        ListHeaderComponent={
          profile.data ? (
            <ReviewSummary
              teacherName={profile.data.fullName.split(/\s+/)[0]}
              average={profile.data.ratingAverage}
              count={profile.data.ratingCount}
            />
          ) : undefined
        }
        ListFooterComponent={
          reviews.isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : undefined
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
