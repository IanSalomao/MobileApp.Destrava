import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ReceivedContactRequest } from '../types';
import { ReceivedRequestCard } from './received-request-card';

function buildRequest(overrides: Partial<ReceivedContactRequest> = {}): ReceivedContactRequest {
  return {
    id: 'request-1',
    status: 'pending',
    guardianName: 'Renata Souza',
    guardianAvatarUrl: null,
    studentName: 'Lívia Souza',
    schoolGrade: 'high_school_1',
    reason: 'A Lívia precisa de ajuda em cinemática e funções.',
    preferredTutoringType: 'online',
    createdAt: new Date(),
    respondedAt: null,
    expiresAt: new Date(2099, 0, 1),
    ...overrides,
  };
}

describe('ReceivedRequestCard', () => {
  it('mostra responsável, aluno/série, motivo, modalidade, tempo e selo Novo', async () => {
    const onPress = jest.fn();
    await render(
      <ReceivedRequestCard request={buildRequest()} isNew onPress={onPress} testID="card" />,
    );

    expect(screen.getByText('Renata Souza')).toBeTruthy();
    expect(screen.getByText('Para Lívia Souza · 1º ano EM')).toBeTruthy();
    expect(screen.getByText('“A Lívia precisa de ajuda em cinemática e funções.”')).toBeTruthy();
    expect(screen.getByText('Online')).toBeTruthy();
    expect(screen.getByText('Agora')).toBeTruthy();
    expect(screen.getByTestId('received-request-new-badge')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não mostra o selo Novo nem o chip quando não há modalidade', async () => {
    await render(
      <ReceivedRequestCard
        request={buildRequest({ status: 'accepted', preferredTutoringType: null })}
        onPress={jest.fn()}
        testID="card"
      />,
    );

    expect(screen.queryByTestId('received-request-new-badge')).toBeNull();
    expect(screen.queryByText('Online')).toBeNull();
  });
});
