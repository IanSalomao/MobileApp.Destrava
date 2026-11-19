import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { useController } from 'react-hook-form';

import { createStudentProfile } from '../api';
import { getStudent, updateStudent } from './api';
import { useStudent, useStudentForm } from './hooks';
import type { StudentDetail } from './types';

jest.mock('@/features/auth/session-provider', () => ({
  useSession: () => ({ session: { user: { id: 'guardian-1' } } }),
}));
jest.mock('../api', () => ({ createStudentProfile: jest.fn() }));
jest.mock('./api', () => ({ getStudent: jest.fn(), updateStudent: jest.fn() }));

const mockCreate = createStudentProfile as jest.MockedFunction<typeof createStudentProfile>;
const mockGet = getStudent as jest.MockedFunction<typeof getStudent>;
const mockUpdate = updateStudent as jest.MockedFunction<typeof updateStudent>;

const STUDENT: StudentDetail = {
  id: 'student-1',
  fullName: 'Lucas Martins',
  schoolGrade: 'elementary_7',
  learningGoal: 'Reforço em frações.',
  subjectIds: ['math'],
};

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function createWrapper(client = createClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

// Preenche o formulário como a tela faz: pelos campos ligados ao control do hook.
function useFilledForm(student?: StudentDetail, onSaved?: () => void) {
  const form = useStudentForm(student, onSaved);
  const {
    field: { onChange: setFullName },
  } = useController({ control: form.control, name: 'fullName' });
  const {
    field: { onChange: setSchoolGrade },
  } = useController({ control: form.control, name: 'schoolGrade' });
  const {
    field: { onChange: setSubjectIds },
  } = useController({ control: form.control, name: 'subjectIds' });

  return { form, setFullName, setSchoolGrade, setSubjectIds };
}

afterEach(() => jest.clearAllMocks());

describe('useStudent', () => {
  it('carrega o aluno do responsável logado', async () => {
    mockGet.mockResolvedValue(STUDENT);

    const { result } = await renderHook(() => useStudent('student-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(STUDENT));
    expect(mockGet).toHaveBeenCalledWith('guardian-1', 'student-1');
    expect(result.current.errorMessage).toBeNull();
  });

  it('sem id (aluno novo) não busca nada', async () => {
    const { result } = await renderHook(() => useStudent(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('traduz o erro de aluno não encontrado', async () => {
    mockGet.mockRejectedValue(new Error('student_not_found'));

    const { result } = await renderHook(() => useStudent('student-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.errorMessage).toBe('Aluno não encontrado.'));
  });
});

describe('useStudentForm', () => {
  describe('editando', () => {
    it('começa com os dados do aluno e salva a edição', async () => {
      mockUpdate.mockResolvedValue(undefined);
      const onSaved = jest.fn();
      const client = createClient();
      const invalidate = jest.spyOn(client, 'invalidateQueries');

      const { result } = await renderHook(() => useStudentForm(STUDENT, onSaved), {
        wrapper: createWrapper(client),
      });

      expect(result.current.isEditing).toBe(true);

      await act(async () => {
        await result.current.submit();
      });

      await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
      expect(mockUpdate).toHaveBeenCalledWith('guardian-1', 'student-1', {
        fullName: 'Lucas Martins',
        schoolGrade: 'elementary_7',
        subjectIds: ['math'],
        learningGoal: 'Reforço em frações.',
      });
      expect(mockCreate).not.toHaveBeenCalled();
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['students'] });
    });

    it('mostra a mensagem em pt-BR quando o aluno não existe mais', async () => {
      mockUpdate.mockRejectedValue(new Error('student_not_found'));
      const onSaved = jest.fn();

      const { result } = await renderHook(() => useStudentForm(STUDENT, onSaved), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.submit();
      });

      await waitFor(() => expect(result.current.errorMessage).toBe('Aluno não encontrado.'));
      expect(onSaved).not.toHaveBeenCalled();
    });
  });

  describe('cadastrando', () => {
    it('com o formulário preenchido, cria o aluno e recarrega as consultas', async () => {
      mockCreate.mockResolvedValue({ id: 'student-2' });
      const onSaved = jest.fn();
      const client = createClient();
      const invalidate = jest.spyOn(client, 'invalidateQueries');

      const { result } = await renderHook(() => useFilledForm(undefined, onSaved), {
        wrapper: createWrapper(client),
      });

      expect(result.current.form.isEditing).toBe(false);

      await act(async () => {
        result.current.setFullName('Ana Souza');
        result.current.setSchoolGrade('high_school_1');
        result.current.setSubjectIds(['math', 'english']);
      });
      await act(async () => {
        await result.current.form.submit();
      });

      await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
      expect(mockCreate).toHaveBeenCalledWith({
        fullName: 'Ana Souza',
        schoolGrade: 'high_school_1',
        subjectIds: ['math', 'english'],
        learningGoal: '',
      });
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['students'] });
    });

    it('formulário vazio não chega ao banco', async () => {
      const onSaved = jest.fn();

      const { result } = await renderHook(() => useStudentForm(undefined, onSaved), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(mockCreate).not.toHaveBeenCalled();
      expect(onSaved).not.toHaveBeenCalled();
    });
  });
});
