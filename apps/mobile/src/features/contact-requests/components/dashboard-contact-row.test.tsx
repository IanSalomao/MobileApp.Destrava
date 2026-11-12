import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { DashboardContactRow } from './dashboard-contact-row';

describe('DashboardContactRow', () => {
  it('exibe nome, subtítulo e tempo e abre a solicitação ao pressionar', async () => {
    const onPress = jest.fn();
    await render(
      <DashboardContactRow
        name="Juliana Martins"
        subtitle="Conversa iniciada"
        timeLabel="Há 2 h"
        onPress={onPress}
        testID="contact-row"
      />,
    );

    expect(screen.getByText('Juliana Martins')).toBeTruthy();
    expect(screen.getByText('Conversa iniciada')).toBeTruthy();
    expect(screen.getByText('Há 2 h')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('contact-row'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('usa as iniciais quando o responsável não tem foto', async () => {
    await render(
      <DashboardContactRow
        name="Carlos Eduardo"
        subtitle="Conversa iniciada"
        timeLabel="Ontem"
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByText('CE')).toBeTruthy();
  });
});
