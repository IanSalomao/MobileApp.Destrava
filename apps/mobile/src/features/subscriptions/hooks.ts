import { zodResolver } from '@hookform/resolvers/zod';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { useSession } from '@/features/auth/session-provider';
import { contactRequestKeys } from '@/features/contact-requests/hooks';
import { teacherKeys } from '@/features/teachers/hooks';

import { buildCardPayload } from './card';
import { getLaunchPlan, getMySubscription, LAUNCH_PLAN_ID, startSubscription } from './api';
import { getSubscriptionErrorMessage } from './errors';
import { cardSchema, type CardInput } from './schemas';

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  plan: ['subscriptions', 'launch-plan'] as const,
  mine: (teacherId: string) => ['subscriptions', 'mine', teacherId] as const,
};

/** Plano de lançamento mostrado na tela de assinatura. */
export function useLaunchPlan() {
  return useQuery({
    queryKey: subscriptionKeys.plan,
    queryFn: getLaunchPlan,
    staleTime: 1000 * 60 * 60, // 1 h
  });
}

/** Assinatura do professor logado (null = nunca assinou). */
export function useMySubscription() {
  const { session } = useSession();
  const teacherId = session?.user.id;

  return useQuery({
    queryKey: subscriptionKeys.mine(teacherId ?? 'anonymous'),
    queryFn: teacherId ? () => getMySubscription(teacherId) : skipToken,
  });
}

// A assinatura decide se o professor aparece nas buscas (is_published): depois de qualquer mudança,
// recarrega a assinatura, o perfil e o painel.
function useInvalidateSubscription() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
      queryClient.invalidateQueries({ queryKey: teacherKeys.all }),
      queryClient.invalidateQueries({ queryKey: contactRequestKeys.all }),
    ]);
}

// ViewModel da tela de assinatura do onboarding: um formulário de cartão com dois caminhos — assinar
// com cartão ("Assinar e continuar") ou começar o teste sem cartão ("Continuar sem cartão").
export function useSubscriptionForm(onStarted?: () => void) {
  const invalidate = useInvalidateSubscription();
  const form = useForm<CardInput>({
    resolver: zodResolver(cardSchema),
    defaultValues: { number: '', expiry: '', cvv: '', holderName: '' },
  });

  const mutation = useMutation({
    mutationFn: startSubscription,
    onSuccess: async () => {
      await invalidate();
      onStarted?.();
    },
  });

  const submitWithCard = () =>
    form.handleSubmit((values) => {
      mutation.mutate({
        planId: LAUNCH_PLAN_ID,
        card: buildCardPayload(values.number, values.expiry),
      });
    })();

  const submitWithoutCard = () => mutation.mutate({ planId: LAUNCH_PLAN_ID });

  return {
    control: form.control,
    submitWithCard,
    submitWithoutCard,
    isSubmitting: mutation.isPending,
    errorMessage: mutation.error ? getSubscriptionErrorMessage(mutation.error) : null,
  };
}
