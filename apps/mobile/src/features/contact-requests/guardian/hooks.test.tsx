import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { useController } from 'react-hook-form';

import type { StudentSummary } from '@/features/students/types';

import { createContactRequest } from './api';
import { useContactRequestForm } from './hooks';
import { NEW_STUDENT_CHOICE } from './schemas';

jest.mock('./api', () => ({
  createContactRequest: jest.fn(),
}));

const mockCreate = createContactRequest as jest.MockedFunction<typeof createContactRequest>;

const LUCAS: StudentSummary = {
  id: 'student-1',
  fullName: 'Lucas Martins',
  schoolGrade: 'elementary_7',
  preferredTutoringType: 'online',
};

const MARIA: StudentSummary = {
  id: 'student-2',
  fullName: 'Maria Martins',
  schoolGrade: 'high_school_1',
  preferredTutoringType: null,
};

function createWrapper(
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

// Além do ViewModel, devolve o campo "reason" para o teste poder digitar como a tela faria.
async function setup(students: StudentSummary[], onSent = jest.fn()) {
  const rendered = await renderHook(
    () => {
      const form = useContactRequestForm({
        teacherId: 'teacher-1',
        guardianName: 'Juliana Martins',
        students,
        onSent,
      });
      const reason = useController({ control: form.control, name: 'reason' });
      return { form, reason };
    },
    { wrapper: createWrapper() },
  );
  return { ...rendered, onSent };
}

describe('useContactRequestForm', () => {
  afterEach(() => jest.clearAllMocks());

  it('começa no primeiro aluno cadastrado', async () => {
    const { result } = await setup([LUCAS, MARIA]);

    expect(result.current.form.hasStudents).toBe(true);
    expect(result.current.form.studentChoice).toBe('student-1');
    expect(result.current.form.selectedStudent).toEqual(LUCAS);
    expect(result.current.form.isNewStudent).toBe(false);
  });

  it('sem alunos cadastrados pede os dados do aluno na hora', async () => {
    const { result } = await setup([]);

    expect(result.current.form.hasStudents).toBe(false);
    expect(result.current.form.studentChoice).toBe(NEW_STUDENT_CHOICE);
    expect(result.current.form.isNewStudent).toBe(true);
  });

  it('trocar o aluno atualiza a escolha e a seleção', async () => {
    const { result } = await setup([LUCAS, MARIA]);

    await act(async () => {
      result.current.form.onStudentChange('student-2');
    });

    expect(result.current.form.studentChoice).toBe('student-2');
    expect(result.current.form.selectedStudent).toEqual(MARIA);
  });

  it('envia a solicitação do aluno cadastrado e avisa a tela', async () => {
    mockCreate.mockResolvedValue({ id: 'request-1' });
    const { result, onSent } = await setup([LUCAS]);

    await act(async () => {
      result.current.reason.field.onChange('Reforço em frações.');
    });
    await act(async () => {
      await result.current.form.submit();
    });

    await waitFor(() => expect(onSent).toHaveBeenCalledTimes(1));
    expect(mockCreate).toHaveBeenCalledWith({
      teacher_id: 'teacher-1',
      student_id: 'student-1',
      guardian_name: 'Juliana Martins',
      student_name: 'Lucas Martins',
      student_school_grade: 'elementary_7',
      student_age: null,
      reason: 'Reforço em frações.',
      preferred_tutoring_type: 'online',
    });
  });

  it('não envia enquanto o formulário estiver inválido', async () => {
    const { result, onSent } = await setup([LUCAS]);

    await act(async () => {
      await result.current.form.submit();
    });

    expect(mockCreate).not.toHaveBeenCalled();
    expect(onSent).not.toHaveBeenCalled();
  });

  it('mostra a mensagem em pt-BR quando o envio falha e não avisa a tela', async () => {
    mockCreate.mockRejectedValue({ code: '23505', message: 'duplicate key' });
    const { result, onSent } = await setup([LUCAS]);

    await act(async () => {
      result.current.reason.field.onChange('Reforço em frações.');
    });
    await act(async () => {
      await result.current.form.submit();
    });

    await waitFor(() =>
      expect(result.current.form.errorMessage).toContain('solicitação em aberto'),
    );
    expect(onSent).not.toHaveBeenCalled();
  });
});