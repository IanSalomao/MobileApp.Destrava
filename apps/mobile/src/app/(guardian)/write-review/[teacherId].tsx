import { router } from 'expo-router';

import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Avaliação do professor: nota de 1 a 5 obrigatória e comentário opcional, liberada para quem
// teve uma solicitação aceita com ele (RF12). Protótipo: "AVALIAÇÃO". Rota provisória até a tela
// ser desenvolvida.
export default function WriteReviewScreen() {
  return (
    <ScreenPlaceholder
      owner="Fátima Pinho"
      links={[{ label: 'Enviar avaliação', onPress: () => router.back() }]}
    />
  );
}
