import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors, radius, spacing, type ColorToken } from '@/theme';

export type RequestDetailStatus = 'accepted' | 'declined' | 'expired' | 'cancelled';

const LABELS: Record<RequestDetailStatus, string> = {
  accepted: 'Pedido aceito',
  declined: 'Pedido recusado',
  expired: 'Pedido expirado',
  cancelled: 'Pedido cancelado',
};

const PALETTE: Record<
  RequestDetailStatus,
  { background: ColorToken; border: ColorToken; text: ColorToken }
> = {
  accepted: {
    background: 'successSoft',
    border: 'successBorder',
    text: 'success',
  },
  declined: {
    background: 'surfaceMuted',
    border: 'border',
    text: 'textMuted',
  },
  expired: {
    background: 'warningSoft',
    border: 'warningBorder',
    text: 'warning',
  },
  cancelled: {
    background: 'surfaceMuted',
    border: 'border',
    text: 'textMuted',
  },
};

export function RequestStatusPill({ status }: { status: RequestDetailStatus }) {
  const palette = PALETTE[status];

  return (
    <View
      testID={`request-status-${status}`}
      style={[
        styles.container,
        { backgroundColor: colors[palette.background], borderColor: colors[palette.border] },
      ]}
    >
      <Text variant="small" color={palette.text} style={styles.label}>
        {LABELS[status]}
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
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
