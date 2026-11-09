import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';
import { useMyProfile } from '@/features/profile/hooks';

// Notificações dos dois papéis (o sino do início): solicitação recebida, aceita, recusada ou
// expirada, avaliação recebida, perfil aprovado e assinatura encerrada. Cada uma abre a tela
// relacionada. Rota provisória até a tela ser desenvolvida.
export default function NotificationsScreen() {
  const role = useMyProfile().data?.role;

  return (
    <ScreenPlaceholder
      owner="Valeria Soares"
      links={[
        {
          label: 'Abrir uma solicitação',
          href:
            role === 'teacher'
              ? { pathname: '/received-requests/[id]', params: { id: 'exemplo' } }
              : { pathname: '/my-requests/[id]', params: { id: 'exemplo' } },
        },
      ]}
    />
  );
}
