import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ContactRequestStatus } from '../../../domain/contact-request';
import type { MyContactRequest } from '../types';
import { MyRequestDetailView, type MyRequestDetailViewProps } from './my-request-detail-view';

const REQUEST: MyContactRequest = {
  id: 'request-1',
  status: 'pending',
  guardianId: 'guardian-1',
  teacherId: 'teacher-1',
  teacherName: 'Mariana Alves',
  teacherAvatarUrl: null,
  teacherPhone: null,
  studentName: 'Lucas Martins',
  studentAge: 12,
  schoolGrade: 'elementary_7',
  reason: 'Reforço em frações.',
  preferredTutoringType: 'online',
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  respondedAt: null,
  expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
};

const handlers = {
  onCancel: jest.fn(),
  onOpenWhatsApp: jest.fn(),
  onAskAgain: jest.fn(),
  onOpenProfile: jest.fn(),
  onReview: jest.fn(),
};

async function renderView(
  status: ContactRequestStatus,
  overrides: Omit<Partial<MyRequestDetailViewProps>, 'request'> & {
    request?: Partial<MyContactRequest>;
  } = {},
) {
  const { request, ...props } = overrides;

  await render(
    <MyRequestDetailView
      request={{ ...REQUEST, status, ...request }}
      status={status}
      canCancel={false}
      canAskAgain={false}
      isCancelling={false}
      errorMessage={null}
      {...handlers}
      {...props}
    />,
  );
}

const button = (name: string) => screen.queryByRole('button', { name });

describe('MyRequestDetailView', () => {
  afterEach(() => jest.clearAllMocks());

  it('mostra o professor e os dados enviados no pedido', async () => {
    await renderView('pending');

    expect(screen.getByText('Mariana Alves')).toBeTruthy();
    expect(screen.getByText('Lucas Martins, 12 anos')).toBeTruthy();
    expect(screen.getByText('Online')).toBeTruthy();
    expect(screen.getByText(/Reforço em frações\./)).toBeTruthy();
  });

  it('sem idade nem preferência de aula, mostra só o nome e "Sem preferência"', async () => {
    await renderView('pending', { request: { studentAge: null, preferredTutoringType: null } });

    expect(screen.getByText('Lucas Martins')).toBeTruthy();
    expect(screen.getByText('Sem preferência')).toBeTruthy();
  });

  describe('pendente', () => {
    it('avisa o prazo e permite cancelar', async () => {
      await renderView('pending', { canCancel: true });

      expect(screen.getByText(/tem até .* para responder/)).toBeTruthy();
      await fireEvent.press(screen.getByRole('button', { name: 'Cancelar solicitação' }));

      expect(handlers.onCancel).toHaveBeenCalledTimes(1);
      expect(button('Conversar no WhatsApp')).toBeNull();
    });

    it('sem permissão de cancelar, o botão não aparece', async () => {
      await renderView('pending');

      expect(button('Cancelar solicitação')).toBeNull();
    });
  });

  describe('aceita', () => {
    it('com número liberado, abre o WhatsApp e leva para avaliar o professor', async () => {
      await renderView('accepted', { request: { teacherPhone: '+5511999991234' } });

      expect(screen.getByText('O WhatsApp de Mariana Alves está liberado.')).toBeTruthy();

      await fireEvent.press(screen.getByRole('button', { name: 'Conversar no WhatsApp' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Avaliar professor' }));

      expect(handlers.onOpenWhatsApp).toHaveBeenCalledTimes(1);
      expect(handlers.onReview).toHaveBeenCalledTimes(1);
    });

    it('sem número cadastrado, desabilita o WhatsApp e explica', async () => {
      await renderView('accepted');

      expect(screen.getByText('O professor ainda não cadastrou o WhatsApp.')).toBeTruthy();
      const whatsapp = screen.getByRole('button', { name: 'Conversar no WhatsApp' });
      expect(whatsapp.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe.each(['declined', 'expired', 'cancelled'] as const)('%s', (status) => {
    it('sem WhatsApp e com o perfil do professor', async () => {
      await renderView(status);

      expect(button('Conversar no WhatsApp')).toBeNull();
      await fireEvent.press(screen.getByRole('button', { name: 'Ver perfil do professor' }));

      expect(handlers.onOpenProfile).toHaveBeenCalledTimes(1);
    });

    it('permite pedir novamente quando liberado', async () => {
      await renderView(status, { canAskAgain: true });

      await fireEvent.press(screen.getByRole('button', { name: 'Pedir novamente' }));

      expect(handlers.onAskAgain).toHaveBeenCalledTimes(1);
    });

    it('esconde "Pedir novamente" quando há outra solicitação aberta', async () => {
      await renderView(status);

      expect(button('Pedir novamente')).toBeNull();
    });
  });

  it('explica o motivo de cada status final', async () => {
    await renderView('expired');
    expect(screen.getByText('O professor não respondeu dentro de 24 horas.')).toBeTruthy();
  });

  it('mostra o erro de uma ação que falhou', async () => {
    await renderView('pending', {
      canCancel: true,
      errorMessage: 'Esta solicitação já foi respondida.',
    });

    expect(screen.getByText('Esta solicitação já foi respondida.')).toBeTruthy();
  });
});