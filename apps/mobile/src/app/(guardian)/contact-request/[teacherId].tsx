import { router } from 'expo-router';

import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Formulário de solicitação de contato: dados do responsável, do aluno e motivo do reforço (RF07).
// Protótipo: "FORMULARIO SOLICIAR CONTATO". Rota provisória até a tela ser desenvolvida.
export default function ContactRequestFormScreen() {
  return (
    <ScreenPlaceholder
      owner="Rebeca Batista"
      links={[
        { label: 'Enviar solicitação', onPress: () => router.replace('/contact-request-sent') },
      ]}
    />
  );
}
