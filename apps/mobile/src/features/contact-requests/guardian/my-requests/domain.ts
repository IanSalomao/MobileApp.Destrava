import { formatRelativeTime } from '@/lib/relative-time';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

import { canRequestAgain, type ContactRequestStatus } from '../../domain/contact-request';
import { groupReceivedRequest } from '../../domain/received-requests';
import type { MyContactRequest, MyRequestFilter } from './types';

// Regras puras de "Minhas solicitações" e do detalhe do pedido. Sem React e sem Supabase.

export const REQUEST_FILTERS: readonly { key: MyRequestFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'accepted', label: 'Aceitas' },
  { key: 'declined', label: 'Recusadas' },
  { key: 'expired', label: 'Expiradas' },
];

export const EMPTY_COPY: Record<MyRequestFilter, { title: string; description: string }> = {
  all: {
    title: 'Nenhuma solicitação ainda',
    description: 'Quando você pedir contato com um professor, o pedido aparece aqui.',
  },
  pending: {
    title: 'Nenhum pedido pendente',
    description: 'Os pedidos que aguardam resposta do professor aparecem aqui.',
  },
  accepted: {
    title: 'Nenhum pedido aceito',
    description: 'Quando um professor aceitar, o WhatsApp dele aparece aqui.',
  },
  declined: {
    title: 'Nenhum pedido recusado',
    description: 'Os pedidos recusados pelos professores aparecem aqui.',
  },
  expired: {
    title: 'Nenhum pedido expirado',
    description: 'Pedidos sem resposta no prazo ou cancelados por você aparecem aqui.',
  },
};

// Depois de recusada, expirada ou cancelada a solicitação libera um novo pedido ao mesmo professor.
const FINAL_STATUSES: readonly ContactRequestStatus[] = ['declined', 'expired', 'cancelled'];

/** Status que a tela mostra: pendente com o prazo de 24 h vencido aparece como expirada. */
export function getDisplayStatus(
  request: Pick<MyContactRequest, 'status' | 'expiresAt'>,
  now: Date = new Date(),
): ContactRequestStatus {
  if (request.status === 'pending' && request.expiresAt.getTime() <= now.getTime()) {
    return 'expired';
  }
  return request.status;
}

/** Aplica o filtro da lista. Cancelada conta como expirada, como na lista do professor. */
export function filterMyRequests(
  requests: readonly MyContactRequest[],
  filter: MyRequestFilter,
  now: Date = new Date(),
): MyContactRequest[] {
  if (filter === 'all') return [...requests];
  return requests.filter((request) => groupReceivedRequest(request, now) === filter);
}

export function countPending(
  requests: readonly MyContactRequest[],
  now: Date = new Date(),
): number {
  return filterMyRequests(requests, 'pending', now).length;
}

/** O responsável cancela enquanto a solicitação está pendente e dentro do prazo. */
export function canCancelMyRequest(request: MyContactRequest, now: Date = new Date()): boolean {
  return getDisplayStatus(request, now) === 'pending';
}

/**
 * "Pedir novamente": só depois de um status final e se não houver outra solicitação aberta
 * (pendente ou aceita) para o mesmo professor, que o índice único do banco recusaria.
 */
export function canAskAgain(
  request: MyContactRequest,
  requests: readonly MyContactRequest[],
): boolean {
  return (
    FINAL_STATUSES.includes(request.status) &&
    canRequestAgain(requests, request.guardianId, request.teacherId)
  );
}

/** "Pedido enviado há 12 min", "Pedido enviado ontem" ou "Pedido enviado agora". */
export function formatSentAt(createdAt: Date, now: Date = new Date()): string {
  const relative = formatRelativeTime(createdAt, now);
  return relative === 'Agora' ? 'Pedido enviado agora' : `Pedido enviado ${relative.toLowerCase()}`;
}

/** Link do WhatsApp do professor com a mensagem pronta, ou null se não há número liberado. */
export function buildTeacherWhatsAppUrl(
  request: Pick<MyContactRequest, 'teacherName' | 'teacherPhone' | 'studentName'>,
  guardianName?: string | null,
): string | null {
  if (!request.teacherPhone) return null;

  const who = guardianName?.trim();
  const intro = who
    ? `Aqui é ${who}, responsável por ${request.studentName}.`
    : `Sou responsável por ${request.studentName}.`;
  const message = `Olá, ${request.teacherName}! ${intro} Enviei um pedido de contato pelo Destrava e gostaria de conversar sobre as aulas.`;

  return buildWhatsAppUrl(request.teacherPhone, message);
}