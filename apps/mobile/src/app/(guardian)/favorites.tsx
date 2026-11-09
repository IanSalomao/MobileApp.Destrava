import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Professores favoritos do responsável (o coração dos cards e do perfil do professor). Sem
// protótipo próprio: segue o card da busca. Rota provisória até a tela ser desenvolvida.
export default function FavoritesScreen() {
  return (
    <ScreenPlaceholder
      owner="Fátima Pinho"
      links={[
        {
          label: 'Perfil de um professor',
          href: { pathname: '/teachers/[id]', params: { id: 'exemplo' } },
        },
      ]}
    />
  );
}
