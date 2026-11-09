import { router } from 'expo-router';

import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Confirmação de solicitação enviada: o professor tem 24 h para responder (RF07). Protótipo:
// "FORMULARIO ENVIADO". Sem header nem gesto de voltar. Rota provisória até a tela ser
// desenvolvida.
export default function ContactRequestSentScreen() {
  return (
    <ScreenPlaceholder
      owner="Rebeca Batista"
      edges={['top', 'bottom']}
      links={[
        // dismissAll volta às abas da área do responsável; navigate escolhe a aba.
        {
          label: 'Acompanhar solicitação',
          onPress: () => {
            router.dismissAll();
            router.navigate('/my-requests');
          },
        },
        {
          label: 'Voltar ao início',
          onPress: () => {
            router.dismissAll();
            router.navigate('/');
          },
        },
      ]}
    />
  );
}
