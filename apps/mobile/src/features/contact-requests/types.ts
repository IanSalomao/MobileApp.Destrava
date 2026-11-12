import type { Enums } from '@/lib/database.types';

import type { ContactRequestStatus } from './domain/contact-request';

export type ContactSummary = Readonly<{
  id: string;
  status: ContactRequestStatus;
  guardianName: string;
  guardianAvatarUrl: string | null;
  studentName: string;
  schoolGrade: Enums<'school_grade'>;
  createdAt: Date;
  respondedAt: Date | null;
}>;

export type TeacherDashboardData = Readonly<{
  isPublished: boolean;
  ratingAverage: number | null;
  ratingCount: number;
  clientsCount: number;
  conversationsCount: number;
  recentContacts: ContactSummary[];
  recentRequests: ContactSummary[];
}>;

export type ReceivedContactRequest = Readonly<{
  id: string;
  status: ContactRequestStatus;
  guardianName: string;
  guardianAvatarUrl: string | null;
  studentName: string;
  schoolGrade: Enums<'school_grade'>;
  reason: string;
  preferredTutoringType: Enums<'tutoring_type'> | null;
  createdAt: Date;
  respondedAt: Date | null;
  expiresAt: Date;
}>;

export type ReceivedRequestFilter = 'pending' | 'accepted' | 'declined' | 'expired';
