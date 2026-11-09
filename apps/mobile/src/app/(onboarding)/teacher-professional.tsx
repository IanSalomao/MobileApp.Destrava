import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { FormChipGroup } from '@/components/form/form-chip-group';
import { FormOptionCards } from '@/components/form/form-option-cards';
import { FormSelectField } from '@/components/form/form-select-field';
import { FormTextField } from '@/components/form/form-text-field';
import { FormWeekdayPicker } from '@/components/form/form-weekday-picker';
import { AvatarPicker } from '@/components/ui/avatar-picker';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { FilePickerField } from '@/components/ui/file-picker-field';
import { Screen } from '@/components/ui/screen';
import { StepHeader } from '@/components/ui/step-header';
import { Text } from '@/components/ui/text';
import { TEACHER_HOME } from '@/features/auth/route-access';
import { useLanguages, useSubjects } from '@/features/catalog/hooks';
import { BRAZILIAN_STATE_OPTIONS, DAY_PERIODS, DAY_PERIOD_LABELS } from '@/features/catalog/types';
import { useTeacherProfileForm } from '@/features/teachers/hooks';
import { maskCpf, maskCurrencyBRL } from '@/lib/masks';
import { colors, spacing } from '@/theme';

const TUTORING_OPTIONS = [
  { value: 'in_person', label: 'Presencial', icon: 'people-outline' as const },
  { value: 'online', label: 'Online', icon: 'globe-outline' as const },
];

const PERIOD_OPTIONS = DAY_PERIODS.map((period) => ({
  value: period,
  label: DAY_PERIOD_LABELS[period],
}));

const STEP_COPY: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: 'Conte sobre você',
    subtitle: 'Esses dados ajudam as famílias a conhecerem seu trabalho.',
  },
  2: { title: 'Sua experiência', subtitle: 'Selecione as áreas em que você pode ajudar.' },
  3: {
    title: 'Como serão as aulas?',
    subtitle: 'Defina sua disponibilidade e formato de atendimento.',
  },
};

export default function TeacherProfessionalScreen() {
  const { data: subjects } = useSubjects();
  const { data: languages } = useLanguages();
  const vm = useTeacherProfileForm(() => router.replace(TEACHER_HOME));

  const subjectOptions = (subjects ?? []).map((subject) => ({
    value: subject.id,
    label: subject.name,
  }));
  const languageOptions = (languages ?? []).map((language) => ({
    value: language.id,
    label: language.name,
  }));

  return (
    <Screen>
      <StepHeader
        eyebrow={`Etapa ${vm.step} de ${vm.totalSteps}`}
        title={STEP_COPY[vm.step].title}
        subtitle={STEP_COPY[vm.step].subtitle}
        step={vm.step}
        totalSteps={vm.totalSteps}
      />

      {vm.step === 1 ? (
        <>
          <AvatarPicker
            imageUri={vm.avatar?.uri}
            onPress={vm.pickAvatar}
            loading={vm.pickingField === 'avatar'}
            hint="JPG ou PNG • Máx. 5 MB"
          />
          <FormTextField
            control={vm.control}
            name="fullName"
            label="Nome completo"
            placeholder="Seu nome"
            leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
          />
          <FormTextField
            control={vm.control}
            name="cpf"
            label="CPF"
            placeholder="000.000.000-00"
            keyboardType="number-pad"
            maskFormatter={maskCpf}
            leftIcon={<Ionicons name="document-outline" size={20} color={colors.textMuted} />}
          />
          <FormSelectField
            control={vm.control}
            name="state"
            label="Estado"
            placeholder="Selecione o estado"
            modalTitle="Estado"
            options={BRAZILIAN_STATE_OPTIONS}
          />
          {vm.showCityField ? (
            <FormSelectField
              control={vm.control}
              name="cityId"
              label="Cidade"
              placeholder={vm.cityPlaceholder}
              modalTitle="Cidade"
              options={vm.cityOptions}
              disabled={vm.isCityDisabled}
              searchable
              searchPlaceholder="Buscar cidade"
            />
          ) : null}
          <FilePickerField
            title="Documento com foto"
            hint="RG ou CNH em PDF, JPG ou PNG"
            fileName={vm.identityDocument?.fileName}
            onPress={vm.pickIdentity}
            loading={vm.pickingField === 'identity'}
            error={vm.identityError}
          />
        </>
      ) : null}

      {vm.step === 2 ? (
        <>
          <FormChipGroup
            control={vm.control}
            name="subjectIds"
            label="Matérias"
            options={subjectOptions}
          />
          <FormChipGroup
            control={vm.control}
            name="languageIds"
            label="Idiomas"
            options={languageOptions}
          />
          <FormTextField
            control={vm.control}
            name="bio"
            label="Sobre suas aulas"
            placeholder="Conte como são suas aulas e sua experiência."
            multiline
            numberOfLines={4}
            style={styles.textarea}
          />
          <FilePickerField
            title="Certificados"
            hint="Adicione diplomas e comprovantes"
            onPress={vm.pickCertificate}
            loading={vm.pickingField === 'certificate'}
          />
          {vm.certificates.map((certificate, index) => (
            <View key={`${certificate.fileName}-${index}`} style={styles.certificateRow}>
              <Ionicons name="document-text" size={18} color={colors.primary} />
              <Text variant="caption" style={styles.certificateName} numberOfLines={1}>
                {certificate.fileName}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remover ${certificate.fileName}`}
                onPress={() => vm.removeCertificate(index)}
              >
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          ))}
        </>
      ) : null}

      {vm.step === 3 ? (
        <>
          <FormOptionCards
            control={vm.control}
            name="tutoringTypes"
            label="Tipo de aula"
            options={TUTORING_OPTIONS}
          />
          <FormTextField
            control={vm.control}
            name="hourlyRate"
            label="Valor por hora"
            placeholder="R$ 0,00"
            keyboardType="number-pad"
            maskFormatter={maskCurrencyBRL}
            leftIcon={
              <Text color="textMuted" variant="label">
                R$
              </Text>
            }
          />
          <FormWeekdayPicker control={vm.control} name="weekdays" label="Dias disponíveis" />
          <FormChipGroup
            control={vm.control}
            name="periods"
            label="Períodos"
            options={PERIOD_OPTIONS}
          />
          <Banner
            variant="info"
            title="Revisão do perfil"
            description="Seus documentos serão verificados antes da publicação."
          />
          {vm.errorMessage ? <Text color="danger">{vm.errorMessage}</Text> : null}
        </>
      ) : null}

      {vm.step < vm.totalSteps ? (
        <Button title="Continuar" onPress={vm.goNext} />
      ) : (
        <Button title="Enviar para análise" loading={vm.isSubmitting} onPress={vm.submit} />
      )}

      {vm.step > 1 ? (
        <Button title="Voltar" variant="ghost" disabled={vm.isSubmitting} onPress={vm.goBack} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  certificateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  certificateName: {
    flex: 1,
  },
});
