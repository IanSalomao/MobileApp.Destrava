import { router, useLocalSearchParams } from 'expo-router';

import { RequestSentView } from '@/features/contact-requests/guardian/components/request-sent-view';

// Confirmação de solicitação enviada: o professor tem 24 h para responder (RF07). Protótipo:
// "FORMULARIO ENVIADO". Sem header nem gesto de voltar (configurado no _layout do grupo).
// O formulário manda o nome do professor em ?teacherName=; sem ele o texto fica genérico.
export default function ContactRequestSentScreen() {
  const { teacherName } = useLocalSearchParams<{ teacherName?: string }>();

  return (
    <RequestSentView
      teacherName={teacherName}
      // dismissAll volta às abas da área do responsável; navigate escolhe a aba.
      onTrackRequest={() => {
        router.dismissAll();
        router.navigate('/my-requests');
      }}
      onGoHome={() => {
        router.dismissAll();
        router.navigate('/');
      }}
    />
  );
}