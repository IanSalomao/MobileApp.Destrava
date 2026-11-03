import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useController, useWatch, type Control } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { Text } from '@/components/ui/text';
import { spacing } from '@/theme';

import { MINOR_DATA_CLAUSE } from '../consent';
import type { SignUpInput } from '../schemas';

// AUT-09: aceite dos Termos e da Política (todos) e, só para responsável, a cláusula
// específica sobre os dados do aluno menor de idade.
export function TermsConsentFields({ control }: { control: Control<SignUpInput> }) {
  const role = useWatch({ control, name: 'role' });
  const {
    field: { value: termsAccepted, onChange: setTermsAccepted },
    fieldState: { error: termsError },
  } = useController({ control, name: 'termsAccepted' });
  const {
    field: { value: minorDataConsent, onChange: setMinorDataConsent },
    fieldState: { error: minorError },
  } = useController({ control, name: 'minorDataConsent' });

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
