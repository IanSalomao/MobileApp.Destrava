import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { CardFields } from '@/features/subscriptions/components/card-fields';
import { PlanCard } from '@/features/subscriptions/components/plan-card';
import { formatCardExpiry, formatCardLabel } from '@/features/subscriptions/domain';
import { useLaunchPlan, useSubscriptionCardForm } from '@/features/subscriptions/hooks';
import { colors, radius, spacing } from '@/theme';

// Cadastro ou troca do cartão da assinatura (RF13). Com a assinatura em teste ou ativa, só troca o
// cartão; encerrada, assina de novo (cobrança simulada). O app só envia bandeira, últimos 4 dígitos
// e validade. Protótipo: "ASSINATURA E PAGAMENTO" (dados do cartão).
export default function SubscriptionCardScreen() {
  const { data: plan } = useLaunchPlan();
  const vm = useSubscriptionCardForm(() => router.back());

  if (vm.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator testID="subscription-card-loading" color={colors.primary} />
      </View>
    );
  }

  if (vm.loadError) {
    return (
      <View style={styles.center}>
        <Banner
          variant="danger"
          title="Não foi possível carregar sua assinatura"
          description="Verifique sua conexão e tente novamente."
        />
        <Button title="Tentar de novo" onPress={vm.retryLoad} />
      </View>
    );
  }

  const current = vm.subscription;

  return (
    <Screen>
      {vm.isRunning ? (
        <View style={styles.currentCard}>
          <Text variant="caption" color="textMuted">
            Cartão atual
          </Text>
          <Text variant="label">
            {formatCardLabel(current?.card_brand ?? null, current?.card_last4 ?? null)}
          </Text>
          {current?.card_last4 ? (
            <Text variant="caption" color="textSecondary">
              Validade {formatCardExpiry(current.card_exp_month, current.card_exp_year)}
            </Text>
          ) : null}
        </View>
      ) : (
        <PlanCard
          plan={plan}
          badge="ASSINAR DE NOVO"
          note="Cobrança mensal. Cancele quando quiser."
        />
      )}

      <Text variant="subtitle">{vm.isRunning ? 'Novo cartão' : 'Dados do cartão'}</Text>
      <CardFields control={vm.control} />

      <Banner
        variant="info"
        title="Pagamento simulado"
        description="Nesta fase nenhuma cobrança real acontece. Guardamos só a bandeira, os 4 últimos dígitos e a validade."
      />

      {vm.errorMessage ? <Text color="danger">{vm.errorMessage}</Text> : null}

      <Button
        title={vm.isRunning ? 'Salvar cartão' : 'Assinar e continuar'}
        loading={vm.isSubmitting}
        onPress={vm.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  currentCard: {
    gap: spacing.xxs,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
