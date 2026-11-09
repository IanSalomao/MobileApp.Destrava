import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Início do responsável: busca de professores na cidade e no estado escolhidos (RF04, RF05,
// RNF01). Protótipo: "HOME E BUSCA". Rota provisória até a tela ser desenvolvida.
export default function GuardianHomeScreen() {
  return (
    <ScreenPlaceholder
      owner="Anna Beatriz Lima"
      links={[
        { label: 'Buscar professores', href: '/search' },
        { label: 'Filtros', href: '/search-filters' },
        { label: 'Alterar cidade', href: '/search-location' },
        {
          label: 'Perfil de um professor',
          href: { pathname: '/teachers/[id]', params: { id: 'exemplo' } },
        },
        { label: 'Notificações', href: '/notifications' },
      ]}
    />
  );
}
