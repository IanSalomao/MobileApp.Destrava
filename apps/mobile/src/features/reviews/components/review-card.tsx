import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors, radius, spacing } from '@/theme';

import { formatReviewDate, formatStars } from '../domain';
import type { Review } from '../types';

// Uma avaliação na lista "Ver todas as avaliações": nome exibido (gerado pelo banco), nota em
// estrelas, data e comentário opcional (RF12).
export function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.card} testID={`review-${review.id}`}>
      <View style={styles.header}>
        <Text variant="label" style={styles.name} numberOfLines={1}>
          {review.reviewerName}
        </Text>
        <Text variant="caption" color="textMuted">
          {formatReviewDate(review.createdAt)}
        </Text>
      </View>
      <Text variant="label" style={styles.stars} accessibilityLabel={`Nota ${review.rating} de 5`}>
        {formatStars(review.rating)}
      </Text>
      {review.comment ? (
        <Text variant="body" color="textSecondary">
          {review.comment}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
  },
  stars: {
    color: colors.warning,
    letterSpacing: 2,
  },
});
