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
