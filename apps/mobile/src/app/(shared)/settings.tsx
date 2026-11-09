import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';
import { useSignOut } from '@/features/auth/hooks';

// Configurações dos dois papéis: limpar o cache local (RNF10), termos, privacidade e sair. Rota
// provisória até a tela ser desenvolvida.
export default function SettingsScreen() {
  const signOut = useSignOut();

  return (
    <ScreenPlaceholder
      owner="Valeria Soares"
      links={[
        { label: 'Termos de Uso', href: '/terms' },
        { label: 'Política de Privacidade', href: '/privacy' },
        { label: 'Sair', onPress: () => signOut.mutate() },
      ]}
    />
  );
}
