import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import {
  useController,
  useWatch,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { Text } from '@/components/ui/text';
import { spacing } from '@/theme';

import { MINOR_DATA_CLAUSE } from '../consent';
// Campos de consentimento que o formulário precisa ter (cadastro e escolha de papel).
type ConsentValues = FieldValues & {
  role?: string;
  termsAccepted: boolean;
  minorDataConsent: boolean;
};

// AUT-09: aceite dos Termos e da Política (todos) e, só para responsável, a cláusula
// específica sobre os dados do aluno menor de idade.
export function TermsConsentFields<T extends ConsentValues>({ control }: { control: Control<T> }) {
  const role = useWatch({ control, name: 'role' as Path<T> });
  const {
    field: { value: termsAccepted, onChange: setTermsAccepted },
    fieldState: { error: termsError },
  } = useController({ control, name: 'termsAccepted' as Path<T> });
  const {
    field: { value: minorDataConsent, onChange: setMinorDataConsent },
    fieldState: { error: minorError },
  } = useController({ control, name: 'minorDataConsent' as Path<T> });

  return (
    <View style={styles.container}>
      <Checkbox
        checked={termsAccepted}
        onChange={setTermsAccepted}
        error={termsError?.message}
        accessibilityLabel="Li e concordo com os Termos de Uso e a Política de Privacidade"
      >
        {'Li e concordo com os '}
        <Text variant="caption" color="primary" onPress={() => router.push('/terms')}>
          Termos de Uso
        </Text>
        {' e a '}
        <Text variant="caption" color="primary" onPress={() => router.push('/privacy')}>
          Política de Privacidade
        </Text>
        {'.'}
      </Checkbox>

      {role === 'guardian' ? (
        <Checkbox
          checked={minorDataConsent}
          onChange={setMinorDataConsent}
          error={minorError?.message}
          accessibilityLabel="Consentimento do responsável para dados do aluno menor de idade"
        >
          {MINOR_DATA_CLAUSE}
        </Checkbox>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
});
