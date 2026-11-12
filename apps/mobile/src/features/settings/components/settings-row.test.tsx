import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { SettingsRow } from './settings-row';

describe('SettingsRow', () => {
  it('mostra título e descrição e dispara a ação', async () => {
    const onPress = jest.fn();
    await render(
      <SettingsRow
        title="Termos de Uso"
        description="Leia as regras do Destrava"
        onPress={onPress}
        testID="row"
      />,
    );

    expect(screen.getByText('Termos de Uso')).toBeTruthy();
    expect(screen.getByText('Leia as regras do Destrava')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('row'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('mostra a ação de sair sem chevron', async () => {
    await render(
      <SettingsRow title="Sair da conta" danger showChevron={false} onPress={jest.fn()} />,
    );

    expect(screen.getByText('Sair da conta')).toBeTruthy();
  });
});
