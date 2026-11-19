import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors, radius, spacing } from '@/theme';

import { formatAverage, formatReviewCount, formatStars } from '../domain';

type ReviewSummaryProps = {
  teacherName: string;
  average: number | null;
  count: number;
};

// Resumo no topo da lista de avaliações: nota média e total, mantidos pelo banco (RF06).
export function ReviewSummary({ teacherName, average, count }: ReviewSummaryProps) {
  return (
    <View style={styles.card}>
      <Text variant="caption" color="textMuted">
        Avaliações de {teacherName}
      </Text>
      <Text variant="title" testID="review-summary-average">
        {formatAverage(average)}
      </Text>
      <Text variant="subtitle" style={styles.stars}>
        {formatStars(average ?? 0)}
      </Text>
      <Text variant="caption" color="textSecondary">
        {formatReviewCount(count)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.xxs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  stars: {
    color: colors.warning,
    letterSpacing: 2,
  },
});
