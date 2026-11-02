import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Rating } from '../Rating';

describe('UI-02b: Rating', () => {
  it('Dado Rating em modo leitura (readOnly), Quando renderizado, Então exibe a nota média formatada e quantidade de avaliações', () => {
    render(<Rating value={4.8} reviewCount={24} readOnly />);

    expect(screen.getByText('4.8')).toBeTruthy();
    expect(screen.getByText('(24)')).toBeTruthy();
  });

  it('Dado Rating interativo (input), Quando o usuário toca na 4ª estrela, Então dispara onChange(4) com área >= 44pt', () => {
    const onChange = jest.fn();
    render(<Rating value={0} onChange={onChange} />);

    const fourthStar = screen.getByTestId('rating-star-4');
    const flatStyle = StyleSheet.flatten(fourthStar.props.style);

    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44);
    expect(flatStyle.minWidth).toBeGreaterThanOrEqual(44);

    fireEvent.press(fourthStar);
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
