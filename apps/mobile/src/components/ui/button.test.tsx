import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './button';
import { colors } from '@/theme';

describe('UI-02a: Button', () => {
  it('renderiza variante primary por padrão, respeita área >= 44pt e dispara onPress', async () => {
    const onPress = jest.fn();
    await render(<Button title="Entrar" onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Entrar' });
    const flatStyle = StyleSheet.flatten(button.props.style);

    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44);
    expect(flatStyle.backgroundColor).toBe(colors.primary);

    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renderiza variante secondary com borda e superfície correta', async () => {
    await render(<Button title="Cancelar" variant="secondary" />);

    const button = screen.getByRole('button', { name: 'Cancelar' });
    const flatStyle = StyleSheet.flatten(button.props.style);

    expect(flatStyle.backgroundColor).toBe(colors.surface);
    expect(flatStyle.borderWidth).toBe(1);
  });

  it('bloqueia cliques quando disabled ou loading e exibe indicador no loading', async () => {
    const onPress = jest.fn();
    const { rerender } = await render(<Button title="Salvar" disabled onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(onPress).not.toHaveBeenCalled();

    await rerender(<Button title="Salvar" loading onPress={onPress} />);
    expect(screen.getByTestId('button-loading-indicator')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});
