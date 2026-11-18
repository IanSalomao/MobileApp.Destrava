import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors, radius, spacing } from '@/theme';

import { RequestStatusPill } from '../../../components/request-status-pill';
import type { ContactRequestStatus } from '../../../domain/contact-request';

// A pílula da Valeria cobre aceita, recusada, expirada e cancelada; a pendente é só do responsável
// ("aguardando resposta").
export function MyRequestStatusPill({ status }: { status: ContactRequestStatus }) {
  if (status !== 'pending') return <RequestStatusPill status={status} />;

  return (
    <View testID="request-status-pending" style={styles.container}>
      <Text variant="small" color="primary" style={styles.label}>
        Aguardando resposta
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});