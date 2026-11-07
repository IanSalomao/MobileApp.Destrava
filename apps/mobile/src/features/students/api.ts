import { supabase } from '@/lib/supabase';

import type { StudentProfileInput } from './schemas';

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
