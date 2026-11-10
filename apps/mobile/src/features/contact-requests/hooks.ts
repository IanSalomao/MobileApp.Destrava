import { skipToken, useQuery } from '@tanstack/react-query';

import { useSession } from '@/features/auth/session-provider';

import { getTeacherDashboard, listReceivedContactRequests } from './api';

export const contactRequestKeys = {
  all: ['contact-requests'] as const,
  teacherDashboard: (teacherId: string) =>
    [...contactRequestKeys.all, 'teacher-dashboard', teacherId] as const,
  received: (teacherId: string) => [...contactRequestKeys.all, 'received', teacherId] as const,
};

/** Painel do início do professor. Fica desabilitado enquanto não há sessão. */
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
