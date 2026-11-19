import { router } from 'expo-router';

import { ChooseRoleScreen } from '@/features/auth/components/choose-role-screen';
import { useChooseRoleForm, useSignOut } from '@/features/auth/hooks';

// Escolha de papel (responsável ou professor), celular e aceite dos termos para quem entrou com o
// Google e ainda não tem papel no perfil (RNF06). O layout raiz manda para cá todo usuário logado sem
// papel (veja homeHref). Depois segue para o onboarding do papel, como no cadastro por e-mail.
export default function ChooseRoleRoute() {
  const signOut = useSignOut();
  const vm = useChooseRoleForm((role) =>
    router.replace(role === 'guardian' ? '/guardian-profile' : '/teacher-subscription'),
  );

  return <ChooseRoleScreen vm={vm} onSignOut={() => signOut.mutate()} />;
}
