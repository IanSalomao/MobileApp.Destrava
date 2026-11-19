import { zodResolver } from '@hookform/resolvers/zod';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, type DefaultValues } from 'react-hook-form';

import { useSession } from '@/features/auth/session-provider';

import { createStudentProfile } from '../api';
import { studentProfileSchema, type StudentProfileInput } from '../schemas';
import { getStudent, updateStudent } from './api';
import { toFormValues } from './domain';
import { getStudentErrorMessage } from './errors';
import type { StudentDetail } from './types';

// Mesmo prefixo de studentKeys (../hooks): salvar um aluno invalida também a lista de alunos.
const STUDENTS_KEY = ['students'] as const;

export const studentFormKeys = {
  detail: (guardianId: string, studentId: string) =>
    [...STUDENTS_KEY, 'detail', guardianId, studentId] as const,
};

const EMPTY_FORM_VALUES: DefaultValues<StudentProfileInput> = {
  fullName: '',
  schoolGrade: undefined,
  subjectIds: [],
  learningGoal: '',
};

/** Aluno que a tela vai editar. Fica desabilitado sem sessão ou sem id (cadastro de aluno novo). */
export function useStudent(studentId: string | undefined) {
  const { session } = useSession();
  const guardianId = session?.user.id;

  const query = useQuery({
    queryKey: studentFormKeys.detail(guardianId ?? 'anonymous', studentId ?? 'unknown'),
    queryFn: guardianId && studentId ? () => getStudent(guardianId, studentId) : skipToken,
  });

  return {
    ...query,
    errorMessage: query.error ? getStudentErrorMessage(query.error) : null,
  };
}

/**
 * ViewModel da tela "Aluno": formulário e gravação. Sem `student` cadastra um aluno novo; com
 * `student` edita o que já existe. Salvar recarrega as consultas de alunos e chama `onSaved`.
 */
export function useStudentForm(student?: StudentDetail, onSaved?: () => void) {
  const { session } = useSession();
  const guardianId = session?.user.id;
  const queryClient = useQueryClient();

  const form = useForm<StudentProfileInput>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: student ? toFormValues(student) : EMPTY_FORM_VALUES,
  });

  const mutation = useMutation({
    mutationFn: async (values: StudentProfileInput) => {
      if (!student) {
        await createStudentProfile(values);
        return;
      }
      if (!guardianId) throw new Error('student_not_found');
      await updateStudent(guardianId, student.id, values);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STUDENTS_KEY });
      onSaved?.();
    },
  });

  return {
    isEditing: Boolean(student),
    control: form.control,
    submit: () => form.handleSubmit((values) => mutation.mutate(values))(),
    isSubmitting: mutation.isPending,
    errorMessage: mutation.error ? getStudentErrorMessage(mutation.error) : null,
  };
}
