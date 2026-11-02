import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Avatar } from '../Avatar';

describe('UI-02b: Avatar', () => {
  it('Dado um Avatar sem foto, Quando renderizado, Então exibe as iniciais do nome como fallback', () => {
    render(<Avatar name="Helena Costa" />);

    expect(screen.getByText('HC')).toBeTruthy();
  });

  it('Dado um Avatar com imageUrl, Quando a imagem falha ao carregar, Então faz fallback para as iniciais', () => {
    render(<Avatar name="Carlos Mendes" imageUrl="https://cdn.destrava.com/invalido.jpg" />);

    const image = screen.getByTestId('avatar-image');
    expect(image).toBeTruthy();

    fireEvent(image, 'error');
    expect(screen.getByText('CM')).toBeTruthy();
  });
});
