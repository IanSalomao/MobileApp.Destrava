import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { colors } from '@/theme';

describe('UI-02a: Button', () => {
  it('renderiza variante primary por padrão, respeita área >= 44pt e dispara onPress', () => {
    const onPress = jest.fn();
    render(<Button title="Entrar" onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Entrar' });
    const flatStyle = StyleSheet.flatten(button.props.style);

    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44);
    expect(flatStyle.backgroundColor).toBe(colors.primary);

    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renderiza variante secondary com borda e superfície correta', () => {
    render(<Button title="Cancelar" variant="secondary" />);

    const button = screen.getByRole('button', { name: 'Cancelar' });
    const flatStyle = StyleSheet.flatten(button.props.style);

    expect(flatStyle.backgroundColor).toBe(colors.surface);
    expect(flatStyle.borderWidth).toBe(1);
  });

  it('bloqueia cliques quando disabled ou loading e exibe indicador no loading', () => {
    const onPress = jest.fn();
    const { rerender } = render(<Button title="Salvar" disabled onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(onPress).not.toHaveBeenCalled();

    rerender(<Button title="Salvar" loading onPress={onPress} />);
    expect(screen.getByTestId('button-loading-indicator')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});
