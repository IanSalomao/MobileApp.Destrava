import { useLocalSearchParams } from 'expo-router';

import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Perfil público do professor, visto pelo responsável: verificação, nota média e total de
// avaliações, matérias, valor e, depois do aceite, rede social e WhatsApp (RF03, RF06, RF09-RF11).
// Protótipos: "DETALHES PROFESSOR", "ANTES DE ACEITAR" e "DEPOIS DE ACEITAR". Rota provisória
// até a tela ser desenvolvida.
export default function TeacherProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenPlaceholder
      owner="Fátima Pinho"
      links={[
        {
          label: 'Solicitar contato',
          href: { pathname: '/contact-request/[teacherId]', params: { teacherId: id } },
        },
        {
          label: 'Avaliações',
          href: { pathname: '/reviews/[teacherId]', params: { teacherId: id } },
        },
        {
          label: 'Avaliar professor',
          href: { pathname: '/write-review/[teacherId]', params: { teacherId: id } },
        },
      ]}
    />
  );
}
