import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';
import { useSignOut } from '@/features/auth/hooks';
import { useSession } from '@/features/auth/session-provider';

// Meu perfil do professor: prévia do perfil público, acesso à edição, à assinatura e às
// avaliações recebidas (RF01, RF06, RF13). Rota provisória até a tela ser desenvolvida. "Sair"
// fica disponível desde já para dar para testar os dois papéis.
export default function TeacherAccountScreen() {
  const { session } = useSession();
  const signOut = useSignOut();

  return (
    <ScreenPlaceholder
      owner="Ian Salomão"
      links={[
        { label: 'Editar perfil', href: '/edit-profile' },
        { label: 'Minha assinatura', href: '/subscription' },
        {
          label: 'Avaliações recebidas',
          href: { pathname: '/reviews/[teacherId]', params: { teacherId: session?.user.id ?? '' } },
        },
        { label: 'Configurações', href: '/settings' },
        { label: 'Sair', onPress: () => signOut.mutate() },
      ]}
    />
  );
}
