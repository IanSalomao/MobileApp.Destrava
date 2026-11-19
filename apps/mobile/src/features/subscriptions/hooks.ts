import { zodResolver } from '@hookform/resolvers/zod';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { useSession } from '@/features/auth/session-provider';
import { contactRequestKeys } from '@/features/contact-requests/hooks';
import { teacherKeys } from '@/features/teachers/hooks';

import { buildCardPayload } from './card';
import {
  cancelSubscription,
  getLaunchPlan,
  getMySubscription,
  LAUNCH_PLAN_ID,
  listSubscriptionPayments,
  resumeSubscription,
  startSubscription,
  updateSubscriptionCard,
} from './api';
import { getSubscriptionState, isSubscriptionRunning } from './domain';
import { getSubscriptionErrorMessage } from './errors';
import { cardSchema, type CardInput } from './schemas';

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  plan: ['subscriptions', 'launch-plan'] as const,
  mine: (teacherId: string) => ['subscriptions', 'mine', teacherId] as const,
  payments: (teacherId: string) => ['subscriptions', 'payments', teacherId] as const,
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

/** Histórico de cobranças simuladas. */
export function useSubscriptionPayments() {
  const { session } = useSession();
  const teacherId = session?.user.id;

  return useQuery({
    queryKey: subscriptionKeys.payments(teacherId ?? 'anonymous'),
    queryFn: teacherId ? () => listSubscriptionPayments(teacherId) : skipToken,
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

// ViewModel da tela "Cartão de crédito": com a assinatura em teste ou ativa, troca o cartão; com a
// assinatura encerrada (ou inexistente), assina de novo com o cartão informado.
export function useSubscriptionCardForm(onSaved?: () => void) {
  const invalidate = useInvalidateSubscription();
  const subscription = useMySubscription();
  const state = getSubscriptionState(subscription.data ?? null);
  const isRunning = isSubscriptionRunning(state);

  const form = useForm<CardInput>({
    resolver: zodResolver(cardSchema),
    defaultValues: { number: '', expiry: '', cvv: '', holderName: '' },
  });

  const mutation = useMutation({
    mutationFn: async (values: CardInput) => {
      const card = buildCardPayload(values.number, values.expiry);
      if (isRunning) return updateSubscriptionCard(card);
      return startSubscription({ planId: LAUNCH_PLAN_ID, card });
    },
    onSuccess: async () => {
      await invalidate();
      onSaved?.();
    },
  });

  const submit = () => form.handleSubmit((values) => mutation.mutate(values))();

  return {
    control: form.control,
    subscription: subscription.data ?? null,
    isLoading: subscription.isPending,
    loadError: subscription.isError,
    retryLoad: () => subscription.refetch(),
    /** true: troca o cartão; false: o salvamento reativa a assinatura (cobrança simulada). */
    isRunning,
    submit,
    isSubmitting: mutation.isPending,
    errorMessage: mutation.error ? getSubscriptionErrorMessage(mutation.error) : null,
  };
}

// Cancelar no fim do período e desfazer o cancelamento ("Minha assinatura").
export function useSubscriptionActions() {
  const invalidate = useInvalidateSubscription();

  const cancel = useMutation({ mutationFn: cancelSubscription, onSuccess: invalidate });
  const resume = useMutation({ mutationFn: resumeSubscription, onSuccess: invalidate });
  const error = cancel.error ?? resume.error;

  return {
    cancel: () => cancel.mutate(),
    resume: () => resume.mutate(),
    isCanceling: cancel.isPending,
    isResuming: resume.isPending,
    errorMessage: error ? getSubscriptionErrorMessage(error) : null,
  };
}
