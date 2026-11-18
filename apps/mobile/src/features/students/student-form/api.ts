import { supabase } from '@/lib/supabase';

import type { StudentProfileInput } from '../schemas';
import { diffSubjects, normalizeLearningGoal } from './domain';
import type { StudentDetail } from './types';

// Model/repositório da tela "Aluno": lê e edita um aluno do responsável logado. O cadastro de um
// aluno novo reaproveita createStudentProfile (../api), o mesmo do onboarding. O RLS já limita ao
// que o responsável possui; o filtro por guardian_id deixa a intenção explícita. Deixa o erro do
// Supabase subir (quem traduz é o hook).

async function listSubjectIds(studentId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('student_subjects')
    .select('subject_id')
    .eq('student_id', studentId);
  if (error) throw error;

  return data.map((row) => row.subject_id);
}

/** Um aluno do responsável. Sem ele (ou de outro responsável), falha com student_not_found. */
export async function getStudent(guardianId: string, studentId: string): Promise<StudentDetail> {
  const { data: student, error } = await supabase
    .from('students')
    .select('id, full_name, school_grade, learning_goal')
    .eq('id', studentId)
    .eq('guardian_id', guardianId)
    .maybeSingle();
  if (error) throw error;
  if (!student) throw new Error('student_not_found');

  return {
    id: student.id,
    fullName: student.full_name,
    schoolGrade: student.school_grade,
    learningGoal: student.learning_goal,
    subjectIds: await listSubjectIds(student.id),
  };
}

/**
 * Salva a edição: os dados do aluno e as matérias de interesse. As matérias novas entram antes de
 * as removidas saírem, então o aluno nunca fica sem matéria no meio do caminho. O banco só deixa
 * atualizar nome, ano escolar e objetivo (a preferência de aula não é tocada).
 */
export async function updateStudent(
  guardianId: string,
  studentId: string,
  input: StudentProfileInput,
): Promise<void> {
  const { data, error } = await supabase
    .from('students')
    .update({
      full_name: input.fullName,
      school_grade: input.schoolGrade,
      learning_goal: normalizeLearningGoal(input.learningGoal),
    })
    .eq('id', studentId)
    .eq('guardian_id', guardianId)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('student_not_found');

  const { toAdd, toRemove } = diffSubjects(await listSubjectIds(studentId), input.subjectIds);

  if (toAdd.length > 0) {
    const rows = toAdd.map((subjectId) => ({ student_id: studentId, subject_id: subjectId }));
    const { error: addError } = await supabase.from('student_subjects').insert(rows);
    if (addError) throw addError;
  }

  if (toRemove.length > 0) {
    const { error: removeError } = await supabase
      .from('student_subjects')
      .delete()
      .eq('student_id', studentId)
      .in('subject_id', toRemove);
    if (removeError) throw removeError;
  }
}