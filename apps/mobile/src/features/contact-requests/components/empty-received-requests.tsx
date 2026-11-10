import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors, radius, spacing } from '@/theme';

type EmptyReceivedRequestsProps = {
  title?: string;
  description?: string;
};

export function EmptyReceivedRequests({
  title = 'Nenhum pedido por aqui',
  description = 'Novos pedidos de responsáveis aparecerão aqui para você avaliar.',
}: EmptyReceivedRequestsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons
          name="document-text-outline"
          size={spacing.xl + spacing.sm}
          color={colors.primary}
        />
      </View>
      <Text variant="subtitle" style={styles.title}>
        {title}
      </Text>
      <Text variant="caption" color="textMuted" style={styles.description}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: spacing.xxl * 2,
    height: spacing.xxl * 2,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
});
