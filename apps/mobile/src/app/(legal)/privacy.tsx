import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { TERMS_VERSION } from '@/features/auth/consent';

// TODO(CTA-04): substituir pelo texto oficial da Política de Privacidade, revisado pelo jurídico.
export default function PrivacyScreen() {
  return (
    <Screen>
      <Text variant="subtitle">Política de Privacidade</Text>
      <Text variant="caption" color="textMuted">
        Versão {TERMS_VERSION}
      </Text>
      <Text color="textMuted">
        O texto completo da Política de Privacidade será publicado aqui.
      </Text>
    </Screen>
  );
}
