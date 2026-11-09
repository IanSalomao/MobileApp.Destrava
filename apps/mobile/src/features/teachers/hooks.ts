import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useSession } from '@/features/auth/session-provider';
import { useCities } from '@/features/catalog/hooks';
import { useMyProfile } from '@/features/profile/hooks';
import { pickDocument, pickImage, type PickedFile } from '@/lib/file-picker';
import { currencyToCents } from '@/lib/masks';

import { saveAndSubmitTeacherProfile } from './api';
import { getTeacherErrorMessage } from './errors';
import { teacherProfileSchema, TEACHER_STEP_FIELDS, type TeacherProfileInput } from './schemas';

const TOTAL_STEPS = 3;

// ViewModel do cadastro profissional (3 etapas num mesmo formulário). Mantém os campos de texto no
// react-hook-form e os arquivos (foto, documento, certificados) em estado próprio.
export function useTeacherProfileForm(onSubmitted?: () => void) {
  const { session } = useSession();
  const teacherId = session?.user.id;
  const profile = useMyProfile();

  const form = useForm<TeacherProfileInput>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      fullName: '',
      cpf: '',
      state: undefined,
      cityId: undefined,
      subjectIds: [],
      languageIds: [],
      bio: '',
      tutoringTypes: [],
      hourlyRate: '',
      weekdays: [],
      periods: [],
    },
  });

  // Pré-preenche o nome vindo do cadastro da conta, sem sobrescrever o que o professor já editou.
  const profileName = profile.data?.full_name;
  useEffect(() => {
    if (profileName && !form.getFieldState('fullName').isDirty) {
      form.setValue('fullName', profileName);
    }
  }, [profileName, form]);

  const selectedState = useWatch({ control: form.control, name: 'state' });

  // A cidade depende do estado: trocar o estado limpa a cidade escolhida antes.
  const previousStateRef = useRef(selectedState);
  useEffect(() => {
    if (previousStateRef.current === selectedState) return;
    previousStateRef.current = selectedState;
    form.resetField('cityId');
  }, [selectedState, form]);

  const cities = useCities(selectedState);
  const cityOptions = (cities.data ?? []).map((city) => ({ value: city.id, label: city.name }));
  // O campo de cidade só aparece depois que o estado é escolhido.
  const cityPlaceholder = cities.isLoading
    ? 'Carregando cidades...'
    : cities.isError
      ? 'Não foi possível carregar as cidades'
      : 'Selecione a cidade';

  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState<PickedFile | null>(null);
  const [identityDocument, setIdentityDocument] = useState<PickedFile | null>(null);
  const [certificates, setCertificates] = useState<PickedFile[]>([]);
  const [identityError, setIdentityError] = useState<string | undefined>();
  const [pickingField, setPickingField] = useState<'avatar' | 'identity' | 'certificate' | null>(
    null,
  );

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
  const pickIdentity = () =>
    runPick('identity', pickDocument, (file) => {
      setIdentityDocument(file);
      setIdentityError(undefined);
    });
  const pickCertificate = () =>
    runPick('certificate', pickDocument, (file) => setCertificates((prev) => [...prev, file]));
  const removeCertificate = (index: number) =>
    setCertificates((prev) => prev.filter((_, i) => i !== index));

  const mutation = useMutation({
    mutationFn: saveAndSubmitTeacherProfile,
    onSuccess: () => onSubmitted?.(),
  });

  const goNext = async () => {
    if (step === 1) {
      const valid = await form.trigger([...TEACHER_STEP_FIELDS[1]]);
      if (!identityDocument) setIdentityError('Envie seu documento com foto.');
      if (!valid || !identityDocument) return;
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
      if (!teacherId || !identityDocument) return;
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
        avatar,
        identityDocument,
        certificates,
      });
    })();

  return {
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
    avatar,
    identityDocument,
    certificates,
    identityError,
    pickingField,
    pickAvatar,
    pickIdentity,
    pickCertificate,
    removeCertificate,
    isSubmitting: mutation.isPending,
    errorMessage: mutation.error ? getTeacherErrorMessage(mutation.error) : null,
  };
}
