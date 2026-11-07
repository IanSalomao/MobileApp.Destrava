import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Text } from './text';

export type StepHeaderProps = {
  /** Linha de contexto em caixa alta (ex.: "RESPONSÁVEL • ETAPA 1 DE 2"). */
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Passo atual (1-based) e total; desenham a barra de progresso. Omita para esconder a barra. */
  step?: number;
  totalSteps?: number;
};

export function StepHeader({ eyebrow, title, subtitle, step, totalSteps }: StepHeaderProps) {
  const showProgress = typeof step === 'number' && typeof totalSteps === 'number' && totalSteps > 0;
  const progress = showProgress ? Math.min(Math.max(step / totalSteps, 0), 1) : 0;

  return (
    <View style={styles.container}>
      {showProgress ? (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
      ) : null}
      <Text variant="small" color="primary" style={styles.eyebrow}>
        {eyebrow.toUpperCase()}
      </Text>
      <Text variant="title">{title}</Text>
      {subtitle ? <Text color="textMuted">{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  track: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  eyebrow: {
    letterSpacing: 1,
  },
});
