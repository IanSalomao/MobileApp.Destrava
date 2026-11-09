import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Solicitações recebidas: aceitar ou recusar as pendentes e WhatsApp nas aceitas (RF08, RF10,
// RF15). Rota provisória até a tela ser desenvolvida.
export default function ReceivedRequestsScreen() {
  return (
    <ScreenPlaceholder
      owner="Valeria Soares"
      links={[
        {
          label: 'Detalhe de uma solicitação',
          href: { pathname: '/received-requests/[id]', params: { id: 'exemplo' } },
        },
      ]}
    />
  );
}
