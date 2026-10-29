import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';

describe('UI-02a: Input / TextField', () => {
  it('renderiza label, ícone, aplica máscara opcional e dispara onChangeText', () => {
    const onChangeText = jest.fn();
    const onlyDigits = (val: string) => val.replace(/\D/g, '');

    render(
      <Input
        label="Celular"
        placeholder="(00) 00000-0000"
        leftIcon={<Text testID="phone-icon">📞</Text>}
        maskFormatter={onlyDigits}
        onChangeText={onChangeText}
      />,
    );

    expect(screen.getByText('Celular')).toBeTruthy();
    expect(screen.getByTestId('phone-icon')).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText('(00) 00000-0000'), '(75) 99999-0000');
    expect(onChangeText).toHaveBeenCalledWith('75999990000');
  });

  it('exibe mensagem de erro tanto via prop error quanto errorMessage', () => {
    const { rerender } = render(<Input label="E-mail" error="E-mail inválido" />);
    expect(screen.getByText('E-mail inválido')).toBeTruthy();

    rerender(<Input label="E-mail" errorMessage="Campo obrigatório" />);
    expect(screen.getByText('Campo obrigatório')).toBeTruthy();
  });

  it('alterna visibilidade da senha com alvo de toque >= 44pt', () => {
    render(<Input label="Senha" placeholder="Digite sua senha" isPassword />);

    const input = screen.getByPlaceholderText('Digite sua senha');
    expect(input.props.secureTextEntry).toBe(true);

    const toggle = screen.getByTestId('password-visibility-toggle');
    const flatToggleStyle = StyleSheet.flatten(toggle.props.style);
    expect(flatToggleStyle.minHeight).toBeGreaterThanOrEqual(44);
    expect(flatToggleStyle.minWidth).toBeGreaterThanOrEqual(44);

    fireEvent.press(toggle);
    expect(screen.getByPlaceholderText('Digite sua senha').props.secureTextEntry).toBe(false);
  });
});
