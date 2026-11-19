import type { Subject } from '@/features/catalog/types';
import { supabase } from '@/lib/supabase';

import type { StudentProfileInput } from './schemas';
import type { StudentSummary } from './types';

// Model/repositório da feature: único lugar que fala com o Supabase. O guardian_id vem do default
// auth.uid() da tabela; o RLS garante que só o responsável cria os próprios alunos.

/** Cria o aluno (etapa 2 do responsável) e vincula as matérias de interesse. */
export async function createStudentProfile(input: StudentProfileInput): Promise<{ id: string }> {
  const { data: student, error } = await supabase
    .from('students')
    .insert({
      full_name: input.fullName,
      school_grade: input.schoolGrade,
      learning_goal: input.learningGoal?.trim() ? input.learningGoal.trim() : null,
    })
    .select('id')
    .single();

  if (error) throw error;

  if (input.subjectIds.length > 0) {
    const rows = input.subjectIds.map((subjectId) => ({
      student_id: student.id,
      subject_id: subjectId,
    }));
    const { error: subjectsError } = await supabase.from('student_subjects').insert(rows);
    if (subjectsError) throw subjectsError;
  }

  return student;
}

/** Alunos do responsável logado, do mais antigo para o mais novo. O RLS já filtra pelo dono. */
export async function listMyStudents(): Promise<StudentSummary[]> {
  const { data, error } = await supabase
    .from('students')
    .select('id, full_name, school_grade, preferred_tutoring_type')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    schoolGrade: row.school_grade,
    preferredTutoringType: row.preferred_tutoring_type,
  }));
}

// Forma da linha de student_subjects com a matéria embutida (ver listMyStudentSubjects).
type StudentSubjectRow = {
  subjects: { id: string; name: string; sort_order: number } | null;
};

/**
 * Matérias de interesse de todos os alunos do responsável logado ("Interesses" do Meu perfil),
 * sem repetição e na ordem do catálogo. O RLS só devolve as matérias dos próprios alunos.
 */
export async function listMyStudentSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('student_subjects')
    .select('subjects ( id, name, sort_order )');

  if (error) throw error;

  const byId = new Map<string, NonNullable<StudentSubjectRow['subjects']>>();
  for (const row of data as unknown as StudentSubjectRow[]) {
    if (row.subjects) byId.set(row.subjects.id, row.subjects);
  }

  return [...byId.values()]
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, 'pt-BR'))
    .map(({ id, name }) => ({ id, name }));
}
