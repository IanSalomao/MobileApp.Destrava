import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { colors, spacing } from '@/theme';

type AccountUnavailableProps = {
  onRetry: () => void;
  onSignOut: () => void;
  isRetrying?: boolean;
};

// Logado, mas sem papel conhecido: o perfil não carregou (sem conexão, por exemplo). Sem o papel a
// guarda de rotas não sabe qual área abrir, então o layout raiz mostra este aviso no lugar das rotas.
export function AccountUnavailable({
  onRetry,
  onSignOut,
  isRetrying = false,
}: AccountUnavailableProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Banner
          variant="danger"
          title="Não foi possível carregar sua conta"
          description="Verifique sua conexão e tente novamente. Se continuar, saia e entre de novo."
        />
        <Button title="Tentar de novo" loading={isRetrying} onPress={onRetry} />
        <Button title="Sair" variant="ghost" onPress={onSignOut} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
});
