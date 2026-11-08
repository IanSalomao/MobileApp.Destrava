import { router } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useSignOut } from '@/features/auth/hooks';
import { useSession } from '@/features/auth/session-provider';
import { ProfileCard } from '@/features/profile/components/profile-card';
import { useMyProfile } from '@/features/profile/hooks';

// As abas só existem com sessão (RF03), então aqui o usuário está sempre logado.
export default function AccountScreen() {
  const { session } = useSession();
  const signOut = useSignOut();
  const { data: profile } = useMyProfile();

  return (
    <Screen>
      <ProfileCard email={session?.user.email} />
      {profile?.role === 'guardian' ? (
        <Button title="Minhas solicitações" onPress={() => router.push('/my-requests')} />
      ) : null}
      {profile?.role === 'teacher' ? (
        <Button title="Solicitações recebidas" onPress={() => router.push('/received-requests')} />
      ) : null}
      <Button
        title="Sair"
        variant="secondary"
        loading={signOut.isPending}
        // Sem navegação manual: ao perder a sessão, a guarda do layout raiz tira o usuário das abas
        // e o leva à primeira tela do fluxo de auth (escolha de perfil).
        onPress={() => signOut.mutate()}
      />
    </Screen>
  );
}
