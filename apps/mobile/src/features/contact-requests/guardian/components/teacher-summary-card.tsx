import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { colors, radius, spacing } from '@/theme';

export type TeacherSummaryCardProps = {
  name: string;
  avatarUrl: string | null;
};

// Cabeçalho do formulário: deixa claro para qual professor o pedido vai.
export function TeacherSummaryCard({ name, avatarUrl }: TeacherSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Avatar name={name} imageUrl={avatarUrl} size="lg" />
      <View style={styles.texts}>
        <Text variant="caption" color="textMuted">
          Solicitar contato com
        </Text>
        <Text variant="subtitle" numberOfLines={2}>
          {name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
});