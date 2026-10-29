import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Button } from '@/shared/ui/components';
import { spacing } from '@/theme';

import type { UserRole } from '@/features/profile/types';

// AUT-01: primeira decisão do visitante. A escolha segue para o cadastro já com o
// perfil definido (/sign-up?role=guardian|teacher); quem já tem conta vai direto ao login.
export function WelcomeScreen() {
  const goToSignUp = (role: UserRole) => router.push({ pathname: '/sign-up', params: { role } });

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="title">Bem-vindo ao Destrava</Text>
        <Text color="textMuted">Como você quer usar o app?</Text>
      </View>

      <View style={styles.option}>
        <Button title="Sou pai ou responsável" onPress={() => goToSignUp('guardian')} />
        <Text variant="caption" color="textMuted">
          Quero encontrar reforço escolar
        </Text>
      </View>

      <View style={styles.option}>
        <Button title="Sou professor" variant="secondary" onPress={() => goToSignUp('teacher')} />
        <Text variant="caption" color="textMuted">
          Quero divulgar minhas aulas
        </Text>
      </View>

      <Button
        title="Já tenho conta? Entrar"
        variant="ghost"
        onPress={() => router.push('/sign-in')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  option: {
    gap: spacing.xs,
  },
});
