import type { Tables } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

import { isExpired } from './domain/contact-request';
import type { ContactSummary, TeacherDashboardData } from './types';

const RECENT_LIMIT = 3;

type ContactRequestRow = Pick<
  Tables<'contact_requests'>,
  | 'id'
  | 'status'
  | 'guardian_id'
  | 'guardian_name'
  | 'student_id'
  | 'student_name'
  | 'student_school_grade'
  | 'created_at'
  | 'responded_at'
  | 'expires_at'
>;
type GuardianProfile = Pick<Tables<'profiles'>, 'id' | 'full_name' | 'avatar_url'>;

function isRowExpired(row: ContactRequestRow, teacherId: string): boolean {
  return isExpired({
    id: row.id,
    guardianId: row.guardian_id,
    teacherId,
    status: 'pending',
    expiresAt: new Date(row.expires_at),
    respondedAt: null,
  });
}

function studentKey(row: ContactRequestRow): string {
  return row.student_id ?? `name:${row.student_name.trim().toLowerCase()}`;
}

function toSummary(
  row: ContactRequestRow,
  guardians: ReadonlyMap<string, GuardianProfile>,
): ContactSummary {
  const guardian = guardians.get(row.guardian_id);

  return {
    id: row.id,
    status: row.status,
    guardianName: guardian?.full_name ?? row.guardian_name,
    guardianAvatarUrl: guardian?.avatar_url ?? null,
    studentName: row.student_name,
    schoolGrade: row.student_school_grade,
    createdAt: new Date(row.created_at),
    respondedAt: row.responded_at ? new Date(row.responded_at) : null,
  };
}

function byMostRecent(a: ContactSummary, b: ContactSummary): number {
  const aTime = (a.respondedAt ?? a.createdAt).getTime();
  const bTime = (b.respondedAt ?? b.createdAt).getTime();
  return bTime - aTime;
}

export async function getTeacherDashboard(teacherId: string): Promise<TeacherDashboardData> {
  const [requestsResult, teacherResult] = await Promise.all([
    supabase
      .from('contact_requests')
      .select(
        'id, status, guardian_id, guardian_name, student_id, student_name, student_school_grade, created_at, responded_at, expires_at',
      )
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false }),
    supabase
      .from('teachers')
      .select('is_published, rating_average, rating_count')
      .eq('id', teacherId)
      .single(),
  ]);

  if (requestsResult.error) throw requestsResult.error;
  if (teacherResult.error) throw teacherResult.error;

  const rows = requestsResult.data;
  const guardianIds = [...new Set(rows.map((row) => row.guardian_id))];

  const guardians = new Map<string, GuardianProfile>();
  if (guardianIds.length > 0) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', guardianIds);
    if (error) throw error;
    for (const profile of data) guardians.set(profile.id, profile);
  }

  const accepted = rows
    .filter((row) => row.status === 'accepted')
    .map((row) => toSummary(row, guardians))
    .sort(byMostRecent);

  const pending = rows
    .filter((row) => row.status === 'pending' && !isRowExpired(row, teacherId))
    .map((row) => toSummary(row, guardians));

  return {
    isPublished: teacherResult.data.is_published,
    ratingAverage: teacherResult.data.rating_average,
    ratingCount: teacherResult.data.rating_count,
    clientsCount: new Set(rows.map(studentKey)).size,
    conversationsCount: accepted.length,
    recentContacts: accepted.slice(0, RECENT_LIMIT),
    recentRequests: pending.slice(0, RECENT_LIMIT),
  };
}
