import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { RequestStatusPill } from './request-status-pill';

describe('RequestStatusPill', () => {
  it('mostra o rótulo de pedido aceito', async () => {
    await render(<RequestStatusPill status="accepted" />);

    expect(screen.getByText('Pedido aceito')).toBeTruthy();
    expect(screen.getByTestId('request-status-accepted')).toBeTruthy();
  });

  it('mostra o rótulo de pedido recusado', async () => {
    await render(<RequestStatusPill status="declined" />);

    expect(screen.getByText('Pedido recusado')).toBeTruthy();
  });
});
