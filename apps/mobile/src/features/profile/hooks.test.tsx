import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { useController } from 'react-hook-form';

import { useSession } from '@/features/auth/session-provider';
import { listMyStudents, listMyStudentSubjects } from '@/features/students/api';
import { pickImage } from '@/lib/file-picker';

import { getMyPhone, getProfile, updateMyAccount, uploadMyAvatar } from './api';
import {
  profileKeys,
  useChangeMyAvatar,
  useGuardianAccount,
  useGuardianAccountForm,
  useMyPhone,
  useMyProfile,
} from './hooks';
import type { Profile } from './types';

// Camada de ViewModel: testamos os hooks mockando as camadas de dados (api.ts), a sessão e a
// galeria.
jest.mock('./api', () => ({
  getProfile: jest.fn(),
  getMyPhone: jest.fn(),
  updateMyAccount: jest.fn(),
  uploadMyAvatar: jest.fn(),
}));
jest.mock('@/features/students/api', () => ({
  createStudentProfile: jest.fn(),
  listMyStudents: jest.fn(),
  listMyStudentSubjects: jest.fn(),
}));
jest.mock('@/features/auth/session-provider', () => ({
  useSession: jest.fn(),
}));
jest.mock('@/lib/file-picker', () => ({ pickImage: jest.fn() }));

const mockGetProfile = getProfile as jest.MockedFunction<typeof getProfile>;
const mockGetPhone = getMyPhone as jest.MockedFunction<typeof getMyPhone>;
const mockUpdate = updateMyAccount as jest.MockedFunction<typeof updateMyAccount>;
const mockUpload = uploadMyAvatar as jest.MockedFunction<typeof uploadMyAvatar>;
const mockListStudents = listMyStudents as jest.MockedFunction<typeof listMyStudents>;
const mockListSubjects = listMyStudentSubjects as jest.MockedFunction<typeof listMyStudentSubjects>;
const mockPickImage = pickImage as jest.MockedFunction<typeof pickImage>;
const mockUseSession = useSession as jest.Mock;

const USER_ID = 'guardian-1';
const PROFILE: Profile = {
  id: USER_ID,
  role: 'guardian',
  full_name: 'Juliana Martins',
  avatar_url: null,
};
const FILE = {
  uri: 'file:///foto.jpg',
  base64: 'aGVsbG8=',
  fileName: 'foto.jpg',
  contentType: 'image/jpeg',
};

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function createWrapper(client = createClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  mockUseSession.mockReturnValue({
    session: { user: { id: USER_ID, email: 'juliana@email.com' } },
  });
});
afterEach(() => jest.clearAllMocks());

describe('useMyProfile e useMyPhone', () => {
  it('carregam o perfil e o celular do usuário logado', async () => {
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetPhone.mockResolvedValue('+5511999991234');
    const wrapper = createWrapper();

    const { result } = await renderHook(() => ({ profile: useMyProfile(), phone: useMyPhone() }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.phone.data).toBe('+5511999991234'));
    expect(result.current.profile.data).toEqual(PROFILE);
    expect(mockGetProfile).toHaveBeenCalledWith(USER_ID);
    expect(mockGetPhone).toHaveBeenCalledWith(USER_ID);
  });

  it('sem sessão, não buscam nada', async () => {
    mockUseSession.mockReturnValue({ session: null });

    const { result } = await renderHook(() => ({ profile: useMyProfile(), phone: useMyPhone() }), {
      wrapper: createWrapper(),
    });

    expect(result.current.profile.fetchStatus).toBe('idle');
    expect(result.current.phone.fetchStatus).toBe('idle');
    expect(mockGetProfile).not.toHaveBeenCalled();
    expect(mockGetPhone).not.toHaveBeenCalled();
  });
});

describe('useGuardianAccount', () => {
  it('monta o que a tela mostra: e-mail, valores iniciais, alunos e interesses', async () => {
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetPhone.mockResolvedValue('+5511999991234');
    mockListStudents.mockResolvedValue([
      {
        id: 's1',
        fullName: 'Gabriel Martins',
        schoolGrade: 'elementary_7',
        preferredTutoringType: null,
      },
    ]);
    mockListSubjects.mockResolvedValue([{ id: 'math', name: 'Matemática' }]);

    const { result } = await renderHook(() => useGuardianAccount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.students).toHaveLength(1);
      expect(result.current.interests).toHaveLength(1);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.profile).toEqual(PROFILE);
    expect(result.current.email).toBe('juliana@email.com');
    expect(result.current.initialValues).toEqual({
      fullName: 'Juliana Martins',
      phone: '(11) 99999-1234',
    });
    expect(result.current.subtitle).toBe('Responsável por Gabriel');
    expect(result.current.students).toHaveLength(1);
    expect(result.current.isLoadingStudents).toBe(false);
    expect(result.current.studentsFailed).toBe(false);
    expect(result.current.interests).toEqual([{ id: 'math', name: 'Matemática' }]);
    expect(result.current.isLoadingInterests).toBe(false);
    expect(result.current.interestsFailed).toBe(false);
  });

  it('com falha no perfil, expõe o erro e tenta de novo só o que falhou', async () => {
    mockGetProfile.mockRejectedValue(new Error('falha'));
    mockGetPhone.mockResolvedValue(null);
    mockListStudents.mockRejectedValue(new Error('falha'));
    mockListSubjects.mockRejectedValue(new Error('falha'));

    const { result } = await renderHook(() => useGuardianAccount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() => expect(result.current.studentsFailed).toBe(true));
    await waitFor(() => expect(result.current.interestsFailed).toBe(true));
    expect(result.current.profile).toBeNull();
    expect(result.current.initialValues).toBeNull();
    expect(result.current.subtitle).toBe('Responsável');
    expect(mockGetProfile).toHaveBeenCalledTimes(1);
    expect(mockGetPhone).toHaveBeenCalledTimes(1);

    mockGetProfile.mockResolvedValue(PROFILE);
    await act(async () => {
      result.current.retry();
      result.current.retryStudents();
    });

    await waitFor(() => expect(result.current.isError).toBe(false));
    expect(mockGetProfile).toHaveBeenCalledTimes(2);
    expect(mockGetPhone).toHaveBeenCalledTimes(1);
    expect(mockListStudents).toHaveBeenCalledTimes(2);
  });

  it('com falha só no celular, tenta de novo o celular', async () => {
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetPhone.mockRejectedValue(new Error('falha'));
    mockListStudents.mockResolvedValue([]);
    mockListSubjects.mockResolvedValue([]);

    const { result } = await renderHook(() => useGuardianAccount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    mockGetPhone.mockResolvedValue(null);
    await act(async () => {
      result.current.retry();
    });

    await waitFor(() =>
      expect(result.current.initialValues).toEqual({
        fullName: 'Juliana Martins',
        phone: '',
      }),
    );
    expect(mockGetProfile).toHaveBeenCalledTimes(1);
  });

  it('sem e-mail na sessão, mostra vazio', async () => {
    mockUseSession.mockReturnValue({ session: null });
    mockListStudents.mockResolvedValue([]);
    mockListSubjects.mockResolvedValue([]);

    const { result } = await renderHook(() => useGuardianAccount(), {
      wrapper: createWrapper(),
    });

    expect(result.current.email).toBe('');
  });
});

// Edita os campos como a tela faz: pelos campos ligados ao control do hook.
function useFilledAccountForm() {
  const form = useGuardianAccountForm({ fullName: 'Juliana Martins', phone: '(11) 99999-1234' });
  const {
    field: { onChange: setFullName },
  } = useController({ control: form.control, name: 'fullName' });
  const {
    field: { onChange: setPhone },
  } = useController({ control: form.control, name: 'phone' });
  return { form, setFullName, setPhone };
}

describe('useGuardianAccountForm', () => {
  it('salva nome e celular em E.164, recarrega o perfil e marca como salvo', async () => {
    mockUpdate.mockResolvedValue(undefined);
    const client = createClient();
    const invalidate = jest.spyOn(client, 'invalidateQueries');

    const { result } = await renderHook(() => useFilledAccountForm(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      result.current.setFullName('  Juliana Souza  ');
      result.current.setPhone('(21) 98888-7777');
    });
    await act(async () => {
      await result.current.form.submit();
    });

    await waitFor(() => expect(result.current.form.isSaved).toBe(true));
    expect(mockUpdate).toHaveBeenCalledWith(USER_ID, {
      fullName: 'Juliana Souza',
      phone: '+5521988887777',
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: profileKeys.all });
    expect(result.current.form.errorMessage).toBeNull();

    // Editar de novo esconde o "salvo".
    await act(async () => {
      result.current.setFullName('Juliana');
    });
    expect(result.current.form.isSaved).toBe(false);
  });

  it('celular inválido não chega ao banco', async () => {
    const { result } = await renderHook(() => useFilledAccountForm(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.setPhone('(11) 9999');
    });
    await act(async () => {
      await result.current.form.submit();
    });

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(result.current.form.isSaved).toBe(false);
  });

  it('traduz a falha ao salvar', async () => {
    mockUpdate.mockRejectedValue({ code: '23514', message: 'check' });

    const { result } = await renderHook(() => useFilledAccountForm(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.form.submit();
    });

    await waitFor(() => expect(result.current.form.errorMessage).toMatch(/120 caracteres/));
    expect(result.current.form.isSaved).toBe(false);
  });

  it('sem sessão, avisa em vez de salvar', async () => {
    mockUseSession.mockReturnValue({ session: null });

    const { result } = await renderHook(() => useFilledAccountForm(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.form.submit();
    });

    await waitFor(() => expect(result.current.form.errorMessage).toMatch(/sessão expirou/));
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe('useChangeMyAvatar', () => {
  it('abre a galeria, envia a foto e recarrega o perfil', async () => {
    mockPickImage.mockResolvedValue(FILE);
    mockUpload.mockResolvedValue('https://x/avatar.jpg?v=1');
    const client = createClient();
    const invalidate = jest.spyOn(client, 'invalidateQueries');

    const { result } = await renderHook(() => useChangeMyAvatar(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await result.current.pickAndUpload();
    });

    await waitFor(() => expect(mockUpload).toHaveBeenCalledWith(USER_ID, FILE));
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: profileKeys.all }));
    await waitFor(() => expect(result.current.isUploading).toBe(false));
    expect(result.current.errorMessage).toBeNull();
  });

  it('galeria cancelada não envia nada', async () => {
    mockPickImage.mockResolvedValue(null);

    const { result } = await renderHook(() => useChangeMyAvatar(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.pickAndUpload();
    });

    expect(mockUpload).not.toHaveBeenCalled();
    expect(result.current.isUploading).toBe(false);
  });

  it('falha ao abrir a galeria vira mensagem', async () => {
    mockPickImage.mockRejectedValue(new Error('permission'));

    const { result } = await renderHook(() => useChangeMyAvatar(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.pickAndUpload();
    });

    expect(result.current.errorMessage).toMatch(/abrir a galeria/);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('traduz a falha no envio', async () => {
    mockPickImage.mockResolvedValue(FILE);
    mockUpload.mockRejectedValue({ statusCode: '413', message: 'Payload too large' });

    const { result } = await renderHook(() => useChangeMyAvatar(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.pickAndUpload();
    });

    await waitFor(() => expect(result.current.errorMessage).toMatch(/5 MB/));
  });

  it('sem sessão, avisa em vez de enviar', async () => {
    mockUseSession.mockReturnValue({ session: null });
    mockPickImage.mockResolvedValue(FILE);

    const { result } = await renderHook(() => useChangeMyAvatar(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.pickAndUpload();
    });

    await waitFor(() => expect(result.current.errorMessage).toMatch(/sessão expirou/));
    expect(mockUpload).not.toHaveBeenCalled();
  });
});
