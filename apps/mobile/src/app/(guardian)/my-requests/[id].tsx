import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Detalhe do pedido do responsável: status, dados enviados, WhatsApp depois do aceite, cancelar
// enquanto pendente e pedir de novo quando recusado ou expirado (RF09, RF10, RF14). Protótipos:
// "DETALHES DA SOLICITACAO" (ACEITA e RECUSADA). Rota provisória até a tela ser desenvolvida.
export default function MyRequestDetailScreen() {
  return (
    <ScreenPlaceholder
      owner="Rebeca Batista"
      links={[
        {
          label: 'Perfil do professor',
          href: { pathname: '/teachers/[id]', params: { id: 'exemplo' } },
        },
        {
          label: 'Avaliar professor',
          href: { pathname: '/write-review/[teacherId]', params: { teacherId: 'exemplo' } },
        },
      ]}
    />
  );
}
