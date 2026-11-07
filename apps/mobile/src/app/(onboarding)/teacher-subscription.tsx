import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { FormTextField } from '@/components/form/form-text-field';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { useLaunchPlan, useSubscriptionForm } from '@/features/subscriptions/hooks';
import { maskCardExpiry, maskCardNumber, onlyDigits } from '@/lib/masks';
import { colors, radius, spacing } from '@/theme';

const PLAN_FEATURES = [
  'Perfil visível para as famílias',
  'Solicitações de contato ilimitadas',
  'Contato pelo WhatsApp após o aceite',
  'Selo de perfil verificado',
];

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function firstChargeDate(trialDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + trialDays);
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
}

export default function TeacherSubscriptionScreen() {
  const { data: plan } = useLaunchPlan();
  const { control, submitWithCard, submitWithoutCard, isSubmitting, errorMessage } =
    useSubscriptionForm(() => router.replace('/teacher-payment-approved'));

  return (
    <Screen>
      <View style={styles.planCard}>
        <View style={styles.illustrativeTag}>
          <Text variant="small" color="onPrimary">
            Ilustrativo
          </Text>
        </View>

        <View style={styles.launchBadge}>
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
        <Text variant="caption" color="onPrimary" style={styles.trialNote}>
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

      <Text variant="caption" color="textMuted">
        Seu teste começa hoje. A primeira cobrança seria em {firstChargeDate(plan?.trial_days ?? 7)}{' '}
        (simulada nesta fase).
      </Text>

      <Text variant="subtitle">Dados do cartão</Text>

      <FormTextField
        control={control}
        name="number"
        label="Número do cartão"
        placeholder="0000 0000 0000 0000"
        keyboardType="number-pad"
        maskFormatter={maskCardNumber}
      />
      <View style={styles.cardRow}>
        <FormTextField
          control={control}
          name="expiry"
          label="Validade"
          placeholder="MM/AA"
          keyboardType="number-pad"
          maskFormatter={maskCardExpiry}
          containerStyle={styles.cardRowItem}
        />
        <FormTextField
          control={control}
          name="cvv"
          label="CVV"
          placeholder="123"
          keyboardType="number-pad"
          maskFormatter={(value) => onlyDigits(value).slice(0, 4)}
          containerStyle={styles.cardRowItem}
        />
      </View>
      <FormTextField
        control={control}
        name="holderName"
        label="Nome no cartão"
        placeholder="NOME COMO NO CARTÃO"
        autoCapitalize="characters"
      />

      {errorMessage ? <Text color="danger">{errorMessage}</Text> : null}

      <Button title="Assinar e continuar" loading={isSubmitting} onPress={submitWithCard} />
      <Button
        title="Continuar sem cartão"
        variant="ghost"
        disabled={isSubmitting}
        onPress={submitWithoutCard}
      />
    </Screen>
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
  launchBadge: {
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
  trialNote: {
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
  cardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardRowItem: {
    flex: 1,
  },
});
