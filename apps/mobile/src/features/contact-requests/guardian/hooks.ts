import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';

import type { StudentSummary } from '@/features/students/types';

import { createContactRequest } from './api';
import {
  buildDefaultValues,
  buildStudentOptions,
  studentFieldsFor,
  toContactRequestPayload,
} from './domain';
import { getCreateContactRequestErrorMessage } from './errors';
import { contactRequestSchema, NEW_STUDENT_CHOICE, type ContactRequestFormValues } from './schemas';

// Chaves das consultas do lado do responsável. Ficam sob 'contact-requests' para a lista "Minhas
// solicitações" (próxima tela) poder invalidar tudo de uma vez depois de um envio.
export const guardianRequestKeys = {
  all: ['contact-requests', 'guardian'] as const,
};

type UseContactRequestFormOptions = {
  teacherId: string;
  guardianName: string;
  students: readonly StudentSummary[];
  /** Chamado depois que a solicitação foi gravada (a tela segue para a confirmação). */
  onSent: () => void;
};

// ViewModel do formulário "Solicitar contato" (RF07): validação, escolha do aluno e envio.
export function useContactRequestForm({
  teacherId,
  guardianName,
  students,
  onSent,
}: UseContactRequestFormOptions) {
  const queryClient = useQueryClient();

  const form = useForm<ContactRequestFormValues>({
    resolver: zodResolver(contactRequestSchema),
    defaultValues: buildDefaultValues(guardianName, students),
  });

  const studentChoice = useWatch({ control: form.control, name: 'studentChoice' });

  const mutation = useMutation({
    mutationFn: (values: ContactRequestFormValues) =>
      createContactRequest(toContactRequestPayload(teacherId, values)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: guardianRequestKeys.all });
      onSent();
    },
  });

  // Trocar o aluno preenche (ou limpa) nome, ano e preferência de aula, e limpa os erros antigos.
  const onStudentChange = (choice: string) => {
    form.reset({
      ...form.getValues(),
      studentChoice: choice,
      ...studentFieldsFor(choice, students),
    });
  };

  return {
    control: form.control,
    hasStudents: students.length > 0,
    studentOptions: buildStudentOptions(students),
    studentChoice,
    selectedStudent: students.find((student) => student.id === studentChoice) ?? null,
    isNewStudent: studentChoice === NEW_STUDENT_CHOICE,
    onStudentChange,
    submit: () => form.handleSubmit((values) => mutation.mutate(values))(),
    isSubmitting: mutation.isPending,
    errorMessage: mutation.error ? getCreateContactRequestErrorMessage(mutation.error) : null,
  };
}
