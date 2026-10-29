import { router } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { useSignOut } from '@/features/auth/hooks';
import { useSession } from '@/features/auth/session-provider';
import { ProfileCard } from '@/features/profile/components/profile-card';

export default function AccountScreen() {
  const { session } = useSession();
  const signOut = useSignOut();

  if (!session) {
    return (
      <Screen>
        <Text variant="subtitle">Entre para continuar</Text>
        <Text color="textMuted">
          Com uma conta você pede contato com professores, conversa pelo chat e deixa avaliações.
        </Text>
        <Button title="Entrar" onPress={() => router.push('/sign-in')} />
        <Button
          title="Criar conta"
          variant="secondary"
          onPress={() => router.push('/(auth)/sign-up')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ProfileCard email={session.user.email} />
      <Button
        title="Sair"
        variant="secondary"
        loading={signOut.isPending}
        onPress={() => signOut.mutate()}
      />
    </Screen>
  );
}
