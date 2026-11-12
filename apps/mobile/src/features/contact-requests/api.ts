import type { Tables } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

import { isExpired } from './domain/contact-request';
import type { ContactSummary, ReceivedContactRequest, TeacherDashboardData } from './types';

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

type ReceivedContactRequestRow = Pick<
  Tables<'contact_requests'>,
  | 'id'
  | 'status'
  | 'guardian_id'
  | 'guardian_name'
  | 'student_name'
  | 'student_school_grade'
  | 'reason'
  | 'preferred_tutoring_type'
  | 'created_at'
  | 'responded_at'
  | 'expires_at'
>;

export type ReceivedContactRequestDetail = ReceivedContactRequest &
  Readonly<{
    guardianId: string;
    teacherId: string;
    studentAge: number | null;
  }>;

export type AnswerContactRequestStatus = 'accepted' | 'declined';

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

function toReceivedContactRequest(
  row: ReceivedContactRequestRow,
  guardians: ReadonlyMap<string, GuardianProfile>,
): ReceivedContactRequest {
  const guardian = guardians.get(row.guardian_id);

  return {
    id: row.id,
    status: row.status,
    guardianName: guardian?.full_name ?? row.guardian_name,
    guardianAvatarUrl: guardian?.avatar_url ?? null,
    studentName: row.student_name,
    schoolGrade: row.student_school_grade,
    reason: row.reason,
    preferredTutoringType: row.preferred_tutoring_type,
    createdAt: new Date(row.created_at),
    respondedAt: row.responded_at ? new Date(row.responded_at) : null,
    expiresAt: new Date(row.expires_at),
  };
}

function byMostRecent(a: ContactSummary, b: ContactSummary): number {
  const aTime = (a.respondedAt ?? a.createdAt).getTime();
  const bTime = (b.respondedAt ?? b.createdAt).getTime();
  return bTime - aTime;
}

async function loadGuardians(
  rows: readonly { guardian_id: string }[],
): Promise<Map<string, GuardianProfile>> {
  const guardianIds = [...new Set(rows.map((row) => row.guardian_id))];
  const guardians = new Map<string, GuardianProfile>();

  if (guardianIds.length === 0) return guardians;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', guardianIds);
  if (error) throw error;
  for (const profile of data) guardians.set(profile.id, profile);

  return guardians;
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
  const guardians = await loadGuardians(rows);

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

export async function listReceivedContactRequests(
  teacherId: string,
): Promise<ReceivedContactRequest[]> {
  const { data, error } = await supabase
    .from('contact_requests')
    .select(
      'id, status, guardian_id, guardian_name, student_name, student_school_grade, reason, preferred_tutoring_type, created_at, responded_at, expires_at',
    )
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const guardians = await loadGuardians(data);
  return data.map((row) => toReceivedContactRequest(row, guardians));
}

export async function getReceivedContactRequest(
  teacherId: string,
  requestId: string,
): Promise<ReceivedContactRequestDetail> {
  const { data, error } = await supabase
    .from('contact_requests')
    .select(
      'id, teacher_id, guardian_id, guardian_name, student_name, student_school_grade, student_age, reason, preferred_tutoring_type, status, created_at, responded_at, expires_at',
    )
    .eq('id', requestId)
    .eq('teacher_id', teacherId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('contact_request_not_found');

  const guardians = await loadGuardians([data]);
  const summary = toReceivedContactRequest(data, guardians);

  return {
    ...summary,
    guardianId: data.guardian_id,
    teacherId: data.teacher_id,
    studentAge: data.student_age,
  };
}

export async function getGuardianContactDetails(guardianId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('contact_details')
    .select('phone')
    .eq('user_id', guardianId)
    .maybeSingle();

  if (error) throw error;
  return data?.phone ?? null;
}

export async function answerContactRequest(
  teacherId: string,
  requestId: string,
  status: AnswerContactRequestStatus,
): Promise<void> {
  const { data, error } = await supabase
    .from('contact_requests')
    .update({ status })
    .eq('id', requestId)
    .eq('teacher_id', teacherId)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('contact_request_already_answered');
}
