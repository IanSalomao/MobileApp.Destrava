import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Minhas solicitações: status de cada pedido (pendente, aceita, recusada, expirada ou cancelada) e
// botão do WhatsApp nas aceitas (RF10, RF14). Protótipo: "TODOS OS CHATS", que virou esta lista.
// Rota provisória até a tela ser desenvolvida.
export default function MyRequestsScreen() {
  return (
    <ScreenPlaceholder
      owner="Rebeca Batista"
      links={[
        {
          label: 'Detalhe de um pedido',
          href: { pathname: '/my-requests/[id]', params: { id: 'exemplo' } },
        },
      ]}
    />
  );
}
