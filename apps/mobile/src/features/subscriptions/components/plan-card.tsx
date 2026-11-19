import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors, radius, spacing } from '@/theme';

import { formatBRL } from '../domain';
import type { SubscriptionPlan } from '../types';

const PLAN_FEATURES = [
  'Perfil visível para as famílias',
  'Solicitações de contato ilimitadas',
  'Contato pelo WhatsApp após o aceite',
  'Selo de perfil verificado',
];

type PlanCardProps = {
  plan: SubscriptionPlan | undefined;
};

// Card verde do plano do professor (protótipo "ASSINATURA E PAGAMENTO"). A cobrança é simulada no
// MVP, por isso o selo "Ilustrativo".
export function PlanCard({ plan }: PlanCardProps) {
  return (
    <View style={styles.planCard}>
      <View style={styles.illustrativeTag}>
        <Text variant="small" color="onPrimary">
          Ilustrativo
        </Text>
      </View>

      <View style={styles.badge}>
        <Text variant="small" color="onPrimary">
          PLANO DE LANÇAMENTO
        </Text>
      </View>

      <Text variant="subtitle" color="onPrimary">
        {plan?.name ?? 'Professor Destrava'}
      </Text>
      <View style={styles.priceRow}>
        <Text variant="title" color="onPrimary">
          R$ {plan ? formatBRL(plan.price_cents) : '29,90'}
        </Text>
        <Text color="onPrimary"> /mês</Text>
      </View>
      <Text variant="caption" color="onPrimary" style={styles.note}>
        {plan?.trial_days ?? 7} dias grátis. Cancele quando quiser.
      </Text>

      <View style={styles.features}>
        {PLAN_FEATURES.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.onPrimary} />
            <Text color="onPrimary" style={styles.featureText}>
              {feature}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  planCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  illustrativeTag: {
    position: 'absolute',
    top: -spacing.sm,
    right: spacing.md,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryPressed,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  note: {
    opacity: 0.9,
  },
  features: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
  },
});
