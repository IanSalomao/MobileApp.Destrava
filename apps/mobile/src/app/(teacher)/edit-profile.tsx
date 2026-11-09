import { router } from 'expo-router';

import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Edição do perfil profissional depois do onboarding: dados, matérias, idiomas, disponibilidade,
// valor, cidade e links de rede social (RF01, RF11). Reaproveita o formulário de
// (onboarding)/teacher-professional. Rota provisória até a tela ser desenvolvida.
export default function EditTeacherProfileScreen() {
  return (
    <ScreenPlaceholder
      owner="Ian Salomão"
      links={[{ label: 'Salvar', onPress: () => router.back() }]}
    />
  );
}
