import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/features/auth/session-provider';

import {
  answerContactRequest,
  getGuardianContactDetails,
  getReceivedContactRequest,
  getTeacherDashboard,
  listReceivedContactRequests,
  type AnswerContactRequestStatus,
} from './api';
import { canAccept, canDecline } from './domain/contact-request';
import { getContactRequestErrorMessage } from './errors';

export const contactRequestKeys = {
  all: ['contact-requests'] as const,
  teacherDashboard: (teacherId: string) =>
    [...contactRequestKeys.all, 'teacher-dashboard', teacherId] as const,
  received: (teacherId: string) => [...contactRequestKeys.all, 'received', teacherId] as const,
  receivedDetail: (teacherId: string, requestId: string) =>
    [...contactRequestKeys.all, 'received-detail', teacherId, requestId] as const,
  guardianContact: (guardianId: string) =>
    [...contactRequestKeys.all, 'guardian-contact', guardianId] as const,
};

export function useTeacherDashboard() {
  const { session } = useSession();
  const teacherId = session?.user.id;

  return useQuery({
    queryKey: contactRequestKeys.teacherDashboard(teacherId ?? 'anonymous'),
    queryFn: teacherId ? () => getTeacherDashboard(teacherId) : skipToken,
  });
}

export function useReceivedContactRequests() {
  const { session } = useSession();
  const teacherId = session?.user.id;

  return useQuery({
    queryKey: contactRequestKeys.received(teacherId ?? 'anonymous'),
    queryFn: teacherId ? () => listReceivedContactRequests(teacherId) : skipToken,
  });
}

export function useReceivedContactRequest(requestId: string | undefined) {
  const { session } = useSession();
  const teacherId = session?.user.id;

  const query = useQuery({
    queryKey: contactRequestKeys.receivedDetail(teacherId ?? 'anonymous', requestId ?? 'unknown'),
    queryFn:
      teacherId && requestId ? () => getReceivedContactRequest(teacherId, requestId) : skipToken,
  });

  const request = query.data;
  const now = new Date();

  return {
    ...query,
    canAccept: Boolean(request && teacherId && canAccept(request, teacherId, now)),
    canDecline: Boolean(request && teacherId && canDecline(request, teacherId, now)),
    errorMessage: query.error ? getContactRequestErrorMessage(query.error) : null,
  };
}

export function useGuardianContactDetails(guardianId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: contactRequestKeys.guardianContact(guardianId ?? 'anonymous'),
    queryFn: guardianId && enabled ? () => getGuardianContactDetails(guardianId) : skipToken,
  });
}

export function useAnswerContactRequest(requestId: string | undefined) {
  const { session } = useSession();
  const teacherId = session?.user.id;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status: AnswerContactRequestStatus) => {
      if (!teacherId || !requestId) throw new Error('contact_request_not_found');
      return answerContactRequest(teacherId, requestId, status);
    },
    onSuccess: () => {
      if (!teacherId || !requestId) return;
      queryClient.invalidateQueries({ queryKey: contactRequestKeys.received(teacherId) });
      queryClient.invalidateQueries({ queryKey: contactRequestKeys.teacherDashboard(teacherId) });
      queryClient.invalidateQueries({
        queryKey: contactRequestKeys.receivedDetail(teacherId, requestId),
      });
    },
  });

  return {
    ...mutation,
    errorMessage: mutation.error ? getContactRequestErrorMessage(mutation.error) : null,
  };
}
