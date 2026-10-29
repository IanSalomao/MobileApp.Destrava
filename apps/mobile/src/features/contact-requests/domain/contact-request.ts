// Domínio puro do ciclo da solicitação de contato. Não importa Supabase, React
// nem nada de infraestrutura: só dados e regras, com o relógio injetável.

export type ContactRequestStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';

export const CONTACT_REQUEST_STATUSES = [
  'pending',
  'accepted',
  'declined',
  'expired',
  'cancelled',
] as const satisfies readonly ContactRequestStatus[];

export type ContactRequest = Readonly<{
  id: string;
  guardianId: string;
  teacherId: string;
  status: ContactRequestStatus;
  expiresAt: Date;
  respondedAt: Date | null;
}>;

// O banco usa o mesmo par no índice único de solicitações em aberto.
const OPEN_STATUSES: readonly ContactRequestStatus[] = ['pending', 'accepted'];

/** Uma solicitação pendente cujo prazo de 24 h já passou é considerada expirada. */
export function isExpired(request: ContactRequest, now: Date = new Date()): boolean {
  return request.status === 'pending' && request.expiresAt.getTime() <= now.getTime();
}

/** Só o professor destinatário aceita uma solicitação pendente e dentro do prazo. */
export function canAccept(
  request: ContactRequest,
  actorId: string,
  now: Date = new Date(),
): boolean {
  return request.status === 'pending' && request.teacherId === actorId && !isExpired(request, now);
}

/** Só o professor destinatário recusa uma solicitação pendente e dentro do prazo. */
export function canDecline(
  request: ContactRequest,
  actorId: string,
  now: Date = new Date(),
): boolean {
  return request.status === 'pending' && request.teacherId === actorId && !isExpired(request, now);
}

/** Só o responsável autor cancela, enquanto o status ainda for pendente. */
export function canCancel(request: ContactRequest, actorId: string): boolean {
  return request.status === 'pending' && request.guardianId === actorId;
}

/**
 * Impede duas solicitações abertas do mesmo responsável para o mesmo professor.
 * Espelha o índice único do banco: pending e accepted ocupam o par; declined,
 * expired e cancelled liberam uma nova solicitação.
 */
export function canRequestAgain(
  requests: readonly ContactRequest[],
  guardianId: string,
  teacherId: string,
): boolean {
  return !requests.some(
    (request) =>
      request.guardianId === guardianId &&
      request.teacherId === teacherId &&
      OPEN_STATUSES.includes(request.status),
  );
}
