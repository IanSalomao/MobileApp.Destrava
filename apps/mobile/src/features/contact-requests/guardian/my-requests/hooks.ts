import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { useState } from 'react';

import { useSession } from '@/features/auth/session-provider';
import { useMyProfile } from '@/features/profile/hooks';

import { getContactRequestErrorMessage } from '../../errors';
import { cancelContactRequest, getMyContactRequest, listMyContactRequests } from './api';
import {
  buildTeacherWhatsAppUrl,
  canAskAgain,
  canCancelMyRequest,
  getDisplayStatus,
} from './domain';
import type { MyContactRequest } from './types';

// Mesmo prefixo de guardianRequestKeys (../hooks): enviar um pedido novo invalida estas consultas.
const GUARDIAN_REQUESTS_KEY = ['contact-requests', 'guardian'] as const;

export const myRequestKeys = {
  list: (guardianId: string) => [...GUARDIAN_REQUESTS_KEY, 'list', guardianId] as const,
  detail: (guardianId: string, requestId: string) =>
    [...GUARDIAN_REQUESTS_KEY, 'detail', guardianId, requestId] as const,
};

/** Lista "Minhas solicitações" (RF14). */
export function useMyContactRequests() {
  const { session } = useSession();
  const guardianId = session?.user.id;

  return useQuery({
    queryKey: myRequestKeys.list(guardianId ?? 'anonymous'),
    queryFn: guardianId ? () => listMyContactRequests(guardianId) : skipToken,
  });
}

/** Detalhe do pedido, já com o que a tela pode oferecer (cancelar, pedir de novo). */
export function useMyContactRequest(requestId: string | undefined) {
  const { session } = useSession();
  const guardianId = session?.user.id;
  // A lista diz se já existe outra solicitação aberta para o mesmo professor ("pedir de novo").
  const list = useMyContactRequests();

  const query = useQuery({
    queryKey: myRequestKeys.detail(guardianId ?? 'anonymous', requestId ?? 'unknown'),
    queryFn:
      guardianId && requestId ? () => getMyContactRequest(guardianId, requestId) : skipToken,
  });

  const request = query.data;
  const now = new Date();

  return {
    ...query,
    displayStatus: request ? getDisplayStatus(request, now) : null,
    canCancel: Boolean(request && canCancelMyRequest(request, now)),
    canAskAgain: Boolean(request && list.data && canAskAgain(request, list.data)),
    errorMessage: query.error ? getContactRequestErrorMessage(query.error) : null,
  };
}

/** Cancela a solicitação pendente. Sucesso ou falha, recarrega: o status pode ter mudado. */
export function useCancelContactRequest(requestId: string | undefined) {
  const { session } = useSession();
  const guardianId = session?.user.id;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!guardianId || !requestId) throw new Error('contact_request_not_found');
      return cancelContactRequest(guardianId, requestId);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: GUARDIAN_REQUESTS_KEY });
    },
  });

  return {
    ...mutation,
    errorMessage: mutation.error ? getContactRequestErrorMessage(mutation.error) : null,
  };
}

/** Abre o WhatsApp do professor de uma solicitação aceita (RF10). */
export function useOpenTeacherWhatsApp() {
  const profile = useMyProfile();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const open = async (
    request: Pick<MyContactRequest, 'teacherName' | 'teacherPhone' | 'studentName'>,
  ) => {
    setErrorMessage(null);

    const url = buildTeacherWhatsAppUrl(request, profile.data?.full_name);
    if (!url) {
      setErrorMessage('Não foi possível montar o link do WhatsApp.');
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      setErrorMessage('Não foi possível abrir o WhatsApp.');
    }
  };

  return { open, errorMessage };
}