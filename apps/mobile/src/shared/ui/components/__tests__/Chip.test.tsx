import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Chip } from '../Chip';

describe('UI-02a: Chip', () => {
  it('renderiza chip selecionável, garante altura >= 44pt e reflete estado selected', async () => {
    const onPress = jest.fn();
    const { rerender } = await render(
      <Chip label="Matemática" selected={false} onPress={onPress} />,
    );

    const chip = screen.getByRole('button', { name: 'Matemática' });
    const flatStyle = StyleSheet.flatten(chip.props.style);

    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44);
    expect(chip.props.accessibilityState.selected).toBe(false);

    await fireEvent.press(chip);
    expect(onPress).toHaveBeenCalledTimes(1);

    await rerender(<Chip label="Matemática" selected={true} onPress={onPress} />);
    expect(
      screen.getByRole('button', { name: 'Matemática' }).props.accessibilityState.selected,
    ).toBe(true);
  });
});
