import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { buildCardPayload } from './card';
import { getLaunchPlan, LAUNCH_PLAN_ID, startSubscription } from './api';
import { getSubscriptionErrorMessage } from './errors';
import { cardSchema, type CardInput } from './schemas';

export const subscriptionKeys = {
  plan: ['subscriptions', 'launch-plan'] as const,
  mine: ['subscriptions', 'mine'] as const,
};

/** Plano de lançamento mostrado na tela de assinatura. */
export function useLaunchPlan() {
  return useQuery({
    queryKey: subscriptionKeys.plan,
    queryFn: getLaunchPlan,
    staleTime: 1000 * 60 * 60, // 1 h
  });
}

// ViewModel da tela de assinatura: um formulário de cartão com dois caminhos — assinar com cartão
// ("Assinar e continuar") ou começar o teste sem cartão ("Continuar sem cartão").
export function useSubscriptionForm(onStarted?: () => void) {
  const form = useForm<CardInput>({
    resolver: zodResolver(cardSchema),
    defaultValues: { number: '', expiry: '', cvv: '', holderName: '' },
  });

  const mutation = useMutation({
    mutationFn: startSubscription,
    onSuccess: () => onStarted?.(),
  });

  const submitWithCard = form.handleSubmit((values) => {
    mutation.mutate({
      planId: LAUNCH_PLAN_ID,
      card: buildCardPayload(values.number, values.expiry),
    });
  });

  const submitWithoutCard = () => mutation.mutate({ planId: LAUNCH_PLAN_ID });

  return {
    control: form.control,
    submitWithCard,
    submitWithoutCard,
    isSubmitting: mutation.isPending,
    errorMessage: mutation.error ? getSubscriptionErrorMessage(mutation.error) : null,
  };
}
