import { router } from 'expo-router';

import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Escolha do estado e da cidade onde buscar ("Buscando perto de ... · Alterar") (RF04). Abre
// como modal. O responsável não tem cidade no banco: guardar a escolha no aparelho ou no perfil é
// decisão de quem desenvolver. Rota provisória até a tela ser desenvolvida.
export default function SearchLocationScreen() {
  return (
    <ScreenPlaceholder
      owner="Anna Beatriz Lima"
      links={[{ label: 'Confirmar', onPress: () => router.back() }]}
    />
  );
}
