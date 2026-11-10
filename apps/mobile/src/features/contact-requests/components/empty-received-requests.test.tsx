import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { EmptyReceivedRequests } from './empty-received-requests';

describe('EmptyReceivedRequests', () => {
  it('mostra o texto padrão do estado vazio', async () => {
    await render(<EmptyReceivedRequests />);

    expect(screen.getByText('Nenhum pedido por aqui')).toBeTruthy();
    expect(
      screen.getByText('Novos pedidos de responsáveis aparecerão aqui para você avaliar.'),
    ).toBeTruthy();
  });

  it('aceita título e descrição próprios de cada aba', async () => {
    await render(
      <EmptyReceivedRequests
        title="Nenhum pedido aceito"
        description="Aceite um pedido para vê-lo aqui."
      />,
    );

    expect(screen.getByText('Nenhum pedido aceito')).toBeTruthy();
    expect(screen.getByText('Aceite um pedido para vê-lo aqui.')).toBeTruthy();
  });
});
