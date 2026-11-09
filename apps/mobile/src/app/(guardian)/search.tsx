import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Resultado da busca de professores, com os filtros aplicados e paginação (RF04, RF05, RNF01).
// Protótipo: "RESULTADO DO FILTRO". Rota provisória até a tela ser desenvolvida.
export default function SearchResultsScreen() {
  return (
    <ScreenPlaceholder
      owner="Anna Beatriz Lima"
      links={[
        { label: 'Filtros', href: '/search-filters' },
        {
          label: 'Perfil de um professor',
          href: { pathname: '/teachers/[id]', params: { id: 'exemplo' } },
        },
      ]}
    />
  );
}
