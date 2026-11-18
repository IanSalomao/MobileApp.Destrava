import type { Enums } from '@/lib/database.types';

import type { ContactRequestStatus } from '../../domain/contact-request';

// Solicitação de contato do ponto de vista do responsável (lista e detalhe). Os campos de
// guardianId, teacherId, status, expiresAt e respondedAt seguem o ContactRequest do domínio.
export type MyContactRequest = Readonly<{
  id: string;
  status: ContactRequestStatus;
  guardianId: string;
  teacherId: string;
  teacherName: string;
  teacherAvatarUrl: string | null;
  /** Celular do professor (E.164). O banco só entrega depois do aceite (RF09). */
  teacherPhone: string | null;
  studentName: string;
  studentAge: number | null;
  schoolGrade: Enums<'school_grade'>;
  reason: string;
  preferredTutoringType: Enums<'tutoring_type'> | null;
  createdAt: Date;
  respondedAt: Date | null;
  expiresAt: Date;
}>;

export type MyRequestFilter = 'all' | 'pending' | 'accepted' | 'declined' | 'expired';