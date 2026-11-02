import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Tabs, type TabOption } from '../Tabs';

type RequestStatusTab = 'pending' | 'accepted' | 'declined';

const STATUS_TABS: TabOption<RequestStatusTab>[] = [
  { key: 'pending', label: 'Pendentes', badgeCount: 3 },
  { key: 'accepted', label: 'Aceitas' },
  { key: 'declined', label: 'Recusadas' },
];

describe('UI-02b: Tabs', () => {
  it('Dado Tabs de status (Pendentes / Aceitas / Recusadas), Quando clicado em outra aba, Então dispara onChange e respeita altura >= 44pt', () => {
    const onChange = jest.fn();
    render(<Tabs options={STATUS_TABS} activeKey="pending" onChange={onChange} />);

    const pendingTab = screen.getByRole('tab', { name: /Pendentes/i });
    const flatStyle = StyleSheet.flatten(pendingTab.props.style);

    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44);
    expect(pendingTab.props.accessibilityState.selected).toBe(true);

    const acceptedTab = screen.getByRole('tab', { name: /Aceitas/i });
    fireEvent.press(acceptedTab);

    expect(onChange).toHaveBeenCalledWith('accepted');
  });
});
