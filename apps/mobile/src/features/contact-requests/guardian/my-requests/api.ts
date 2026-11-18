import type { Tables } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

import type { MyContactRequest } from './types';

// Model/repositório de "Minhas solicitações": lê e cancela as solicitações do responsável logado.
// O RLS já limita ao que ele participa; o filtro por guardian_id deixa a intenção explícita.
// Deixa o erro do Supabase subir (quem traduz é o hook).

const COLUMNS =
  'id, status, guardian_id, teacher_id, student_name, student_age, student_school_grade, reason, preferred_tutoring_type, created_at, responded_at, expires_at';

type Row = Pick<
  Tables<'contact_requests'>,
  | 'id'
  | 'status'
  | 'guardian_id'
  | 'teacher_id'
  | 'student_name'
  | 'student_age'
  | 'student_school_grade'
  | 'reason'
  | 'preferred_tutoring_type'
  | 'created_at'
  | 'responded_at'
  | 'expires_at'
>;

type TeacherProfile = Pick<Tables<'profiles'>, 'id' | 'full_name' | 'avatar_url'>;

async function loadTeacherProfiles(rows: readonly Row[]): Promise<Map<string, TeacherProfile>> {
  const teacherIds = [...new Set(rows.map((row) => row.teacher_id))];
  const teachers = new Map<string, TeacherProfile>();
  if (teacherIds.length === 0) return teachers;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', teacherIds);
  if (error) throw error;

  for (const profile of data) teachers.set(profile.id, profile);
  return teachers;
}

// O celular do professor só é legível depois do aceite (RLS de contact_details, RF09).
async function loadTeacherPhones(rows: readonly Row[]): Promise<Map<string, string>> {
  const acceptedIds = [
    ...new Set(rows.filter((row) => row.status === 'accepted').map((row) => row.teacher_id)),
  ];
  const phones = new Map<string, string>();
  if (acceptedIds.length === 0) return phones;

  const { data, error } = await supabase
    .from('contact_details')
    .select('user_id, phone')
    .in('user_id', acceptedIds);
  if (error) throw error;

  for (const contact of data) {
    if (contact.phone) phones.set(contact.user_id, contact.phone);
  }
  return phones;
}

async function toMyContactRequests(rows: readonly Row[]): Promise<MyContactRequest[]> {
  const [teachers, phones] = await Promise.all([
    loadTeacherProfiles(rows),
    loadTeacherPhones(rows),
  ]);

  return rows.map((row) => {
    const teacher = teachers.get(row.teacher_id);

    return {
      id: row.id,
      status: row.status,
      guardianId: row.guardian_id,
      teacherId: row.teacher_id,
      teacherName: teacher?.full_name || 'Professor',
      teacherAvatarUrl: teacher?.avatar_url ?? null,
      teacherPhone: phones.get(row.teacher_id) ?? null,
      studentName: row.student_name,
      studentAge: row.student_age,
      schoolGrade: row.student_school_grade,
      reason: row.reason,
      preferredTutoringType: row.preferred_tutoring_type,
      createdAt: new Date(row.created_at),
      respondedAt: row.responded_at ? new Date(row.responded_at) : null,
      expiresAt: new Date(row.expires_at),
    };
  });
}

/** Todas as solicitações do responsável, da mais nova para a mais antiga (RF14). */
export async function listMyContactRequests(guardianId: string): Promise<MyContactRequest[]> {
  const { data, error } = await supabase
    .from('contact_requests')
    .select(COLUMNS)
    .eq('guardian_id', guardianId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return toMyContactRequests(data);
}

/** Uma solicitação do responsável. Sem ela (ou de outro responsável), falha com not_found. */
export async function getMyContactRequest(
  guardianId: string,
  requestId: string,
): Promise<MyContactRequest> {
  const { data, error } = await supabase
    .from('contact_requests')
    .select(COLUMNS)
    .eq('id', requestId)
    .eq('guardian_id', guardianId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('contact_request_not_found');

  const [request] = await toMyContactRequests([data]);
  return request;
}

/** Cancela uma solicitação ainda pendente (o trigger do banco valida a transição). */
export async function cancelContactRequest(guardianId: string, requestId: string): Promise<void> {
  const { data, error } = await supabase
    .from('contact_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)
    .eq('guardian_id', guardianId)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('contact_request_already_answered');
}