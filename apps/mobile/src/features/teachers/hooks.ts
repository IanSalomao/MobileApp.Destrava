import { zodResolver } from '@hookform/resolvers/zod';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useSession } from '@/features/auth/session-provider';
import { useCities } from '@/features/catalog/hooks';
import { contactRequestKeys } from '@/features/contact-requests/hooks';
import { profileKeys, useMyProfile } from '@/features/profile/hooks';
import { pickDocument, pickImage, type PickedFile } from '@/lib/file-picker';
import { currencyToCents } from '@/lib/masks';

import {
  getMyTeacherProfile,
  saveAndSubmitTeacherProfile,
  updateTeacherProfile,
  type SaveTeacherProfileParams,
} from './api';
import { isVerificationEditable, toTeacherProfileFormValues } from './domain';
import { getTeacherErrorMessage } from './errors';
import { publicTeacherKeys } from './public-profile/hooks';
import { teacherProfileSchema, TEACHER_STEP_FIELDS, type TeacherProfileInput } from './schemas';

const TOTAL_STEPS = 3;

export const teacherKeys = {
  all: ['teachers', 'mine'] as const,
  mine: (teacherId: string) => [...teacherKeys.all, teacherId] as const,
};

/** Perfil profissional do professor logado (com CPF, documentos e rede social). */
export function useMyTeacherProfile({ enabled = true }: { enabled?: boolean } = {}) {
  const { session } = useSession();
  const teacherId = session?.user.id;

  return useQuery({
    queryKey: teacherKeys.mine(teacherId ?? 'anonymous'),
    queryFn: teacherId && enabled ? () => getMyTeacherProfile(teacherId) : skipToken,
  });
}

export type TeacherProfileFormMode = 'onboarding' | 'edit';

const EMPTY_VALUES: TeacherProfileInput = {
  fullName: '',
  cpf: '',
  state: undefined as unknown as TeacherProfileInput['state'],
  cityId: undefined as unknown as number,
  subjectIds: [],
  languageIds: [],
  bio: '',
  tutoringTypes: [],
  hourlyRate: '',
  weekdays: [],
  periods: [],
  socialNetwork: 'instagram',
  socialUrl: '',
};

// ViewModel do cadastro profissional (3 etapas num mesmo formulário). Mantém os campos de texto no
// react-hook-form e os arquivos (foto, documento, certificados) em estado próprio. No modo 'edit'
// (Editar perfil) carrega o perfil salvo e, se a verificação já foi aprovada, trava CPF e documento.
export function useTeacherProfileForm(
  onSubmitted?: () => void,
  mode: TeacherProfileFormMode = 'onboarding',
) {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const teacherId = session?.user.id;
  const profile = useMyProfile();
  const isEdit = mode === 'edit';
  const saved = useMyTeacherProfile({ enabled: isEdit });
  const savedProfile = isEdit ? saved.data : undefined;

  const form = useForm<TeacherProfileInput>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: EMPTY_VALUES,
  });

  const selectedState = useWatch({ control: form.control, name: 'state' });
  const previousStateRef = useRef(selectedState);

  // Edição: preenche o formulário com o perfil salvo uma única vez (refetches não apagam o que o
  // professor está digitando).
  const hasLoadedSavedRef = useRef(false);
  useEffect(() => {
    if (!savedProfile || hasLoadedSavedRef.current) return;
    hasLoadedSavedRef.current = true;
    const values = toTeacherProfileFormValues(savedProfile);
    previousStateRef.current = values.state;
    form.reset(values);
  }, [savedProfile, form]);

  // Onboarding: pré-preenche o nome vindo do cadastro da conta, sem sobrescrever o que já foi editado.
  const profileName = profile.data?.full_name;
  useEffect(() => {
    if (isEdit) return;
    if (profileName && !form.getFieldState('fullName').isDirty) {
      form.setValue('fullName', profileName);
    }
  }, [isEdit, profileName, form]);

  // A cidade depende do estado: trocar o estado limpa a cidade escolhida antes.
  useEffect(() => {
    if (previousStateRef.current === selectedState) return;
    previousStateRef.current = selectedState;
    form.setValue('cityId', undefined as unknown as number);
  }, [selectedState, form]);

  const cities = useCities(selectedState);
  const cityOptions = (cities.data ?? []).map((city) => ({ value: city.id, label: city.name }));
  // O campo de cidade só aparece depois que o estado é escolhido.
  const cityPlaceholder = cities.isLoading
    ? 'Carregando cidades...'
    : cities.isError
      ? 'Não foi possível carregar as cidades'
      : 'Selecione a cidade';

  const verificationStatus = savedProfile?.verificationStatus ?? 'draft';
  const canEditVerification = !isEdit || isVerificationEditable(verificationStatus);

  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState<PickedFile | null>(null);
  const [identityDocument, setIdentityDocument] = useState<PickedFile | null>(null);
  const [certificates, setCertificates] = useState<PickedFile[]>([]);
  const [identityError, setIdentityError] = useState<string | undefined>();
  const [pickingField, setPickingField] = useState<'avatar' | 'identity' | 'certificate' | null>(
    null,
  );

  const savedIdentityName = savedProfile?.identityDocumentName ?? null;
  const hasIdentity = Boolean(identityDocument || savedIdentityName);

  const runPick = async (
    field: 'avatar' | 'identity' | 'certificate',
    picker: () => Promise<PickedFile | null>,
    onPicked: (file: PickedFile) => void,
  ) => {
    setPickingField(field);
    try {
      const file = await picker();
      if (file) onPicked(file);
    } finally {
      setPickingField(null);
    }
  };

  const pickAvatar = () => runPick('avatar', pickImage, setAvatar);
  const pickIdentity = () => {
    if (!canEditVerification) return;
    return runPick('identity', pickDocument, (file) => {
      setIdentityDocument(file);
      setIdentityError(undefined);
    });
  };
  const pickCertificate = () =>
    runPick('certificate', pickDocument, (file) => setCertificates((prev) => [...prev, file]));
  const removeCertificate = (index: number) =>
    setCertificates((prev) => prev.filter((_, i) => i !== index));

  const mutation = useMutation({
    mutationFn: (params: SaveTeacherProfileParams) =>
      isEdit
        ? updateTeacherProfile({ ...params, verificationStatus })
        : saveAndSubmitTeacherProfile(params),
    onSuccess: async () => {
      // Nome, foto, publicação e nota aparecem em várias telas: recarrega tudo o que depende disso.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: teacherKeys.all }),
        queryClient.invalidateQueries({ queryKey: profileKeys.all }),
        queryClient.invalidateQueries({ queryKey: publicTeacherKeys.all }),
        queryClient.invalidateQueries({ queryKey: contactRequestKeys.all }),
      ]);
      onSubmitted?.();
    },
  });

  const goNext = async () => {
    if (step === 1) {
      const valid = await form.trigger([...TEACHER_STEP_FIELDS[1]]);
      if (!hasIdentity) setIdentityError('Envie seu documento com foto.');
      if (!valid || !hasIdentity) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      const valid = await form.trigger([...TEACHER_STEP_FIELDS[2]]);
      if (!valid) return;
      setStep(3);
    }
  };

  const goBack = () => setStep((current) => Math.max(1, current - 1));

  const submit = () =>
    form.handleSubmit((values) => {
      if (!teacherId || !hasIdentity) return;
      mutation.mutate({
        teacherId,
        fullName: values.fullName,
        cpf: values.cpf,
        state: values.state,
        cityId: values.cityId,
        subjectIds: values.subjectIds,
        languageIds: values.languageIds,
        bio: values.bio,
        tutoringTypes: values.tutoringTypes,
        hourlyRateCents: currencyToCents(values.hourlyRate) ?? 0,
        weekdays: values.weekdays,
        periods: values.periods,
        socialLink: values.socialUrl.trim()
          ? { network: values.socialNetwork, url: values.socialUrl }
          : null,
        avatar,
        identityDocument,
        certificates,
      });
    })();

  return {
    mode,
    control: form.control,
    cityOptions,
    cityPlaceholder,
    showCityField: Boolean(selectedState),
    isCityDisabled: cities.isLoading || cities.isError,
    step,
    totalSteps: TOTAL_STEPS,
    goNext,
    goBack,
    submit,
    avatarUri: avatar?.uri ?? savedProfile?.avatarUrl ?? null,
    identityFileName: identityDocument?.fileName ?? savedIdentityName,
    canEditVerification,
    verificationStatus,
    savedCertificateNames: savedProfile?.certificateNames ?? [],
    certificates,
    identityError,
    pickingField,
    pickAvatar,
    pickIdentity,
    pickCertificate,
    removeCertificate,
    /** Edição: o perfil salvo ainda está carregando (ou falhou). */
    isLoadingSaved: isEdit && saved.isPending,
    loadError: isEdit && saved.isError,
    retryLoad: () => saved.refetch(),
    isSubmitting: mutation.isPending,
    errorMessage: mutation.error ? getTeacherErrorMessage(mutation.error) : null,
  };
}

export type TeacherProfileFormViewModel = ReturnType<typeof useTeacherProfileForm>;
