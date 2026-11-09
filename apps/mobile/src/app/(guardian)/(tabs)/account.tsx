import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';
import { useSignOut } from '@/features/auth/hooks';

// Meu perfil do responsável: nome, e-mail, celular, foto, alunos e interesses. Protótipo:
// "PERFIL RESPONSAVEL". Rota provisória até a tela ser desenvolvida. "Sair" fica disponível
// desde já para dar para testar os dois papéis.
export default function GuardianAccountScreen() {
  const signOut = useSignOut();

  return (
    <ScreenPlaceholder
      owner="Fátima Pinho"
      links={[
        { label: 'Aluno', href: { pathname: '/students/[id]', params: { id: 'exemplo' } } },
        { label: 'Cadastrar aluno', href: { pathname: '/students/[id]', params: { id: 'new' } } },
        { label: 'Favoritos', href: '/favorites' },
        { label: 'Configurações', href: '/settings' },
        { label: 'Sair', onPress: () => signOut.mutate() },
      ]}
    />
  );
}
