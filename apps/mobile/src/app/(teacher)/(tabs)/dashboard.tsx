import { ScreenPlaceholder } from '@/components/scaffold/screen-placeholder';

// Início do professor: situação do perfil (verificação e assinatura), números e últimas
// solicitações. Protótipo: "AREA DO PROFESSOR - HOME". Rota provisória até a tela ser
// desenvolvida.
export default function TeacherDashboardScreen() {
  return (
    <ScreenPlaceholder
      owner="Valeria Soares"
      links={[
        {
          label: 'Detalhe de uma solicitação',
          href: { pathname: '/received-requests/[id]', params: { id: 'exemplo' } },
        },
        { label: 'Notificações', href: '/notifications' },
        { label: 'Minha assinatura', href: '/subscription' },
      ]}
    />
  );
}
