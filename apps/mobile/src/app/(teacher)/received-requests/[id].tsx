import { router } from 'expo-router';

import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Detalhe da solicitação para o professor: dados do responsável e do aluno, motivo, aceitar ou
// recusar e, depois do aceite, WhatsApp (RF08-RF10). Protótipos: "DETALHES DA SOLICITACAO"
// (ACEITA e RECUSADA). Rota provisória até a tela ser desenvolvida.
export default function ReceivedRequestDetailScreen() {
  return (
    <ScreenPlaceholder
      owner="Valeria Soares"
      links={[
        { label: 'Aceitar', onPress: () => router.back() },
        { label: 'Recusar', onPress: () => router.back() },
      ]}
    />
  );
}
