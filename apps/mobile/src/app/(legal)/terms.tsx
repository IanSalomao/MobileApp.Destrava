import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { TERMS_VERSION } from '@/features/auth/consent';

// TODO(CTA-04): substituir pelo texto oficial dos Termos de Uso, revisado pelo jurídico.
export default function TermsScreen() {
  return (
    <Screen>
      <Text variant="subtitle">Termos de Uso</Text>
      <Text variant="caption" color="textMuted">
        Versão {TERMS_VERSION}
      </Text>
      <Text color="textMuted">O texto completo dos Termos de Uso será publicado aqui.</Text>
    </Screen>
  );
}
