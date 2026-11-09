import { router } from 'expo-router';

import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Filtros da busca: matéria, idioma, faixa de preço, tipo de aula e disponibilidade (RF05).
// Protótipo: "FILTRO". Abre como modal. Rota provisória até a tela ser desenvolvida.
export default function SearchFiltersScreen() {
  return (
    <ScreenPlaceholder
      owner="Anna Beatriz Lima"
      links={[
        // Volta para o resultado se ele já está aberto; senão, abre no lugar do modal.
        { label: 'Ver professores', onPress: () => router.dismissTo('/search') },
      ]}
    />
  );
}
