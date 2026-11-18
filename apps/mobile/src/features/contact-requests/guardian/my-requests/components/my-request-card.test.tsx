import { fireEvent, render, screen } from '@testing-library/react-native';

import type { MyContactRequest } from '../types';
import { MyRequestCard } from './my-request-card';

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

const ACCEPTED: MyContactRequest = {
  ...REQUEST,
  status: 'accepted',
  teacherPhone: '+5511999991234',
};

describe('MyRequestCard', () => {
  const onPress = jest.fn();
  const onOpenWhatsApp = jest.fn();

  afterEach(() => jest.clearAllMocks());

  it('mostra o professor, o aluno, o motivo e o status', async () => {
    await render(<MyRequestCard request={REQUEST} status="pending" onPress={onPress} />);

    expect(screen.getByText('Mariana Alves')).toBeTruthy();
    expect(screen.getByText(/Lucas Martins/)).toBeTruthy();
    expect(screen.getByText(/Reforço em frações\./)).toBeTruthy();
    expect(screen.getByTestId('request-status-pending')).toBeTruthy();
  });

  it('tocar no card abre o pedido', async () => {
    await render(
      <MyRequestCard request={REQUEST} status="pending" onPress={onPress} testID="card" />,
    );

    await fireEvent.press(screen.getByTestId('card'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('aceita com número liberado mostra o WhatsApp, que não abre o pedido', async () => {
    await render(
      <MyRequestCard
        request={ACCEPTED}
        status="accepted"
        onPress={onPress}
        onOpenWhatsApp={onOpenWhatsApp}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Conversar no WhatsApp' }));

    expect(onOpenWhatsApp).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('não mostra o WhatsApp se a solicitação não foi aceita', async () => {
    await render(
      <MyRequestCard
        request={{ ...ACCEPTED, status: 'pending' }}
        status="pending"
        onPress={onPress}
        onOpenWhatsApp={onOpenWhatsApp}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Conversar no WhatsApp' })).toBeNull();
  });

  it('não mostra o WhatsApp se o professor ainda não tem número liberado', async () => {
    await render(
      <MyRequestCard
        request={{ ...ACCEPTED, teacherPhone: null }}
        status="accepted"
        onPress={onPress}
        onOpenWhatsApp={onOpenWhatsApp}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Conversar no WhatsApp' })).toBeNull();
  });
});