import { router } from 'expo-router';

import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Cadastro e edição de um aluno (filho) do responsável: nome, ano escolar e matérias. Use o id
// "new" para cadastrar. Dados de menor: só o próprio responsável lê (LGPD). Rota provisória até a
// tela ser desenvolvida.
export default function StudentScreen() {
  return (
    <ScreenPlaceholder
      owner="Rebeca Batista"
      links={[{ label: 'Salvar', onPress: () => router.back() }]}
    />
  );
}
