import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { featureFlags } from '@/lib/feature-flags';
import { colors, spacing } from '@/theme';

import { useGoogleSignIn } from '../hooks';

// "Continuar com Google" (RNF06). Só aparece com EXPO_PUBLIC_GOOGLE_AUTH_ENABLED=true, depois que o
// provedor estiver configurado no Supabase; assim o botão nunca leva a um erro de configuração.
export function GoogleSignInButton() {
  if (!featureFlags.googleAuth) return null;
  return <GoogleSignInButtonContent />;
}

function GoogleSignInButtonContent() {
  const { signIn, isPending, errorMessage } = useGoogleSignIn();

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text variant="caption" color="textMuted">
          ou
        </Text>
        <View style={styles.line} />
      </View>
      <Button
        title="Continuar com Google"
        variant="secondary"
        loading={isPending}
        onPress={signIn}
        leftIcon={<Ionicons name="logo-google" size={18} color={colors.primary} />}
      />
      {errorMessage ? (
        <Text accessibilityRole="alert" color="danger">
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
});
