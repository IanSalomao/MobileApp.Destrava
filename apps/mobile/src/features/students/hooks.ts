import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { getAuthErrorMessage } from '@/features/auth/errors';

import { createStudentProfile, listMyStudents, listMyStudentSubjects } from './api';
import { studentProfileSchema, type StudentProfileInput } from './schemas';

export const studentKeys = {
  all: ['students'] as const,
  list: () => [...studentKeys.all, 'list'] as const,
  subjects: () => [...studentKeys.all, 'subjects'] as const,
};

// ViewModel da etapa 2 do responsável ("Configure seu perfil"): formulário + criação do aluno.
export function useGuardianProfileForm(onCreated?: () => void) {
  const form = useForm<StudentProfileInput>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: { fullName: '', schoolGrade: undefined, subjectIds: [], learningGoal: '' },
  });

  const mutation = useMutation({
    mutationFn: createStudentProfile,
    onSuccess: () => onCreated?.(),
  });

  return {
    control: form.control,
    submit: () => form.handleSubmit((values) => mutation.mutate(values))(),
    isSubmitting: mutation.isPending,
    errorMessage: mutation.error ? getAuthErrorMessage(mutation.error) : null,
  };
}

/** Alunos (filhos) do responsável logado. */
export function useMyStudents() {
  return useQuery({
    queryKey: studentKeys.list(),
    queryFn: listMyStudents,
  });
}

/** Matérias de interesse dos alunos do responsável logado, sem repetição. */
export function useMyStudentSubjects() {
  return useQuery({
    queryKey: studentKeys.subjects(),
    queryFn: listMyStudentSubjects,
  });
}
