import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';
import { useSignOut } from '@/features/auth/hooks';

// Escolha de papel (responsável ou professor) e aceite dos termos para quem entrou com o Google e
// ainda não tem papel no perfil (RNF06). O layout raiz manda para cá todo usuário logado sem papel
// (veja homeHref). Rota provisória até a tela ser desenvolvida.
export default function ChooseRoleScreen() {
  const signOut = useSignOut();

  return (
    <ScreenPlaceholder
      owner="Ian Salomão"
      links={[{ label: 'Sair', onPress: () => signOut.mutate() }]}
    />
  );
}
