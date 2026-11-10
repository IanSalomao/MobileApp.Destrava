import type { ContactRequestStatus } from './contact-request';

export type ReceivedRequestGroup = 'pending' | 'accepted' | 'declined' | 'expired';

type ReceivedRequestGroupInput = Readonly<{
  status: ContactRequestStatus;
  expiresAt: Date;
}>;

export function groupReceivedRequest(
  request: ReceivedRequestGroupInput,
  now: Date = new Date(),
): ReceivedRequestGroup {
  switch (request.status) {
    case 'accepted':
      return 'accepted';
    case 'declined':
      return 'declined';
    case 'expired':
    case 'cancelled':
      return 'expired';
    case 'pending':
      return request.expiresAt.getTime() <= now.getTime() ? 'expired' : 'pending';
  }
}
