import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TeacherCard } from '../TeacherCard';

describe('UI-02b: TeacherCard', () => {
  const defaultProps = {
    id: 'teacher-1',
    name: 'Profa. Mariana Silva',
    avatarUrl: null,
    isVerified: true,
    subjects: ['Matemática', 'Física'],
    hourlyRateCents: 6500,
    ratingAverage: 4.9,
    ratingCount: 18,
    distanceLabel: '1–3 km',
  };

  it('Dado um TeacherCard de professor verificado, Quando renderizado, Então exibe nome, iniciais, selo de verificado, matérias em chips, valor/hora, nota e faixa de distância', () => {
    const onPress = jest.fn();
    render(<TeacherCard {...defaultProps} onPress={onPress} />);

    expect(screen.getByText('Profa. Mariana Silva')).toBeTruthy();
    expect(screen.getByText('Verificado')).toBeTruthy();
    expect(screen.getByText('Matemática')).toBeTruthy();
    expect(screen.getByText('Física')).toBeTruthy();
    expect(screen.getByText('R$ 65/h')).toBeTruthy();
    expect(screen.getByText('4.9')).toBeTruthy();
    expect(screen.getByText('1–3 km')).toBeTruthy();

    fireEvent.press(screen.getByTestId('teacher-card-teacher-1'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Dado um professor não verificado, Quando renderizado, Então não exibe o selo Verificado', () => {
    render(<TeacherCard {...defaultProps} isVerified={false} />);

    expect(screen.queryByText('Verificado')).toBeNull();
  });
});
