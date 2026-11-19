import { fireEvent, render, screen } from '@testing-library/react-native';

import { StudentCard } from './student-card';

const STUDENT = { id: 's1', fullName: 'Gabriel Martins', schoolGrade: 'elementary_7' as const };

describe('StudentCard', () => {
  it('mostra iniciais, nome e ano escolar', async () => {
    await render(<StudentCard student={STUDENT} onPress={jest.fn()} />);

    expect(screen.getByText('GM')).toBeTruthy();
    expect(screen.getByText('Gabriel Martins')).toBeTruthy();
    expect(screen.getByText('7º ano do Ensino Fundamental')).toBeTruthy();
  });

  it('abre o aluno ao tocar', async () => {
    const onPress = jest.fn();
    await render(<StudentCard student={STUDENT} onPress={onPress} />);

    await fireEvent.press(
      screen.getByRole('button', { name: 'Gabriel Martins, 7º ano do Ensino Fundamental' }),
    );

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
