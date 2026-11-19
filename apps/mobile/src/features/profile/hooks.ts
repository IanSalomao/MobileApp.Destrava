import { zodResolver } from '@hookform/resolvers/zod';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';

import { useSession } from '@/features/auth/session-provider';
import { useMyStudents, useMyStudentSubjects } from '@/features/students/hooks';
import { pickImage, type PickedFile } from '@/lib/file-picker';
import { toE164BR } from '@/lib/phone';

import { getMyPhone, getProfile, updateMyAccount, uploadMyAvatar } from './api';
import { formatGuardianSubtitle, toPhoneInput } from './domain';
import { getProfileErrorMessage } from './errors';
import { guardianAccountSchema, type GuardianAccountInput } from './schemas';

export const profileKeys = {
  all: ['profiles'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
  phone: (userId: string) => [...profileKeys.detail(userId), 'phone'] as const,
};

/** Perfil do usuário logado. Fica desabilitado enquanto não há sessão. */
export function useMyProfile() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: profileKeys.detail(userId ?? 'anonymous'),
    queryFn: userId ? () => getProfile(userId) : skipToken,
  });
}

/** Celular do usuário logado (E.164 ou null). Fica desabilitado enquanto não há sessão. */
export function useMyPhone() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: profileKeys.phone(userId ?? 'anonymous'),
    queryFn: userId ? () => getMyPhone(userId) : skipToken,
  });
}

/**
 * ViewModel do Meu perfil do responsável (tudo menos o formulário): perfil, e-mail da sessão,
 * alunos e matérias de interesse. `initialValues` só existe depois que perfil e celular carregam;
 * é o ponto de partida de useGuardianAccountForm.
 */
export function useGuardianAccount() {
  const { session } = useSession();
  const profile = useMyProfile();
  const phone = useMyPhone();
  const students = useMyStudents();
  const interests = useMyStudentSubjects();

  const studentList = students.data ?? [];
  const initialValues: GuardianAccountInput | null =
    profile.data && phone.isSuccess
      ? { fullName: profile.data.full_name, phone: toPhoneInput(phone.data) }
      : null;

  return {
    isLoading: profile.isPending || phone.isPending,
    isError: profile.isError || phone.isError,
    retry: () => {
      if (profile.isError) void profile.refetch();
      if (phone.isError) void phone.refetch();
    },
    profile: profile.data ?? null,
    email: session?.user.email ?? '',
    initialValues,
    subtitle: formatGuardianSubtitle(studentList.map((student) => student.fullName)),
    students: studentList,
    isLoadingStudents: students.isPending,
    studentsFailed: students.isError,
    retryStudents: () => void students.refetch(),
    interests: interests.data ?? [],
    isLoadingInterests: interests.isPending,
    interestsFailed: interests.isError,
  };
}

/**
 * ViewModel de "Seus dados" no Meu perfil do responsável: nome e celular. `initialValues` vem
 * do perfil e do celular já carregados (celular mascarado, veja toPhoneInput). Salvar grava os
 * dois e recarrega as consultas do perfil.
 */
export function useGuardianAccountForm(initialValues: GuardianAccountInput) {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const form = useForm<GuardianAccountInput>({
    resolver: zodResolver(guardianAccountSchema),
    defaultValues: initialValues,
  });
  const { isDirty } = useFormState({ control: form.control });

  const mutation = useMutation({
    mutationFn: async (values: GuardianAccountInput) => {
      if (!userId) throw new Error('not_authenticated');
      const phone = toE164BR(values.phone);
      if (!phone) throw new Error('invalid_phone');
      await updateMyAccount(userId, { fullName: values.fullName, phone });
    },
    onSuccess: (_data, values) => {
      // O que foi salvo vira o novo ponto de partida: editar de novo esconde o "salvo".
      form.reset(values);
      void queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });

  return {
    control: form.control,
    submit: () => form.handleSubmit((values) => mutation.mutate(values))(),
    isSubmitting: mutation.isPending,
    isSaved: mutation.isSuccess && !isDirty,
    errorMessage: mutation.error ? getProfileErrorMessage(mutation.error) : null,
  };
}

/** Trocar a foto de perfil: abre a galeria, envia a imagem escolhida e recarrega o perfil. */
export function useChangeMyAvatar() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const [isPicking, setIsPicking] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (file: PickedFile) => {
      if (!userId) throw new Error('not_authenticated');
      return uploadMyAvatar(userId, file);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });

  const pickAndUpload = async () => {
    setPickError(null);
    setIsPicking(true);
    try {
      const file = await pickImage();
      if (file) mutation.mutate(file);
    } catch {
      setPickError('Não foi possível abrir a galeria. Tente de novo.');
    } finally {
      setIsPicking(false);
    }
  };

  return {
    pickAndUpload,
    isUploading: isPicking || mutation.isPending,
    errorMessage: pickError ?? (mutation.error ? getProfileErrorMessage(mutation.error) : null),
  };
}
