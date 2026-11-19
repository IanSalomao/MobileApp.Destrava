import { router } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { CardFields } from '@/features/subscriptions/components/card-fields';
import { PlanCard } from '@/features/subscriptions/components/plan-card';
import { useLaunchPlan, useSubscriptionForm } from '@/features/subscriptions/hooks';

function firstChargeDate(trialDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + trialDays);
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
}

// Assinatura do onboarding do professor (RF13): teste grátis com ou sem cartão. Cobrança simulada.
export default function TeacherSubscriptionScreen() {
  const { data: plan } = useLaunchPlan();
  const { control, submitWithCard, submitWithoutCard, isSubmitting, errorMessage } =
    useSubscriptionForm(() => router.replace('/teacher-payment-approved'));

  return (
    <Screen>
      <PlanCard plan={plan} />

      <Text variant="caption" color="textMuted">
        Seu teste começa hoje. A primeira cobrança seria em {firstChargeDate(plan?.trial_days ?? 7)}{' '}
        (simulada nesta fase).
      </Text>

      <Text variant="subtitle">Dados do cartão</Text>
      <CardFields control={control} />

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
