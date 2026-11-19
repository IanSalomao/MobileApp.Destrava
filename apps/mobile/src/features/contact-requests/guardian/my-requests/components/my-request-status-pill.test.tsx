import { render, screen } from '@testing-library/react-native';

import { MyRequestStatusPill } from './my-request-status-pill';

describe('MyRequestStatusPill', () => {
  it('pendente mostra "Aguardando resposta"', async () => {
    await render(<MyRequestStatusPill status="pending" />);

    expect(screen.getByTestId('request-status-pending')).toBeTruthy();
    expect(screen.getByText('Aguardando resposta')).toBeTruthy();
  });

  it.each([
    ['accepted', 'Pedido aceito'],
    ['declined', 'Pedido recusado'],
    ['expired', 'Pedido expirado'],
    ['cancelled', 'Pedido cancelado'],
  ] as const)('%s reaproveita a pílula da lista do professor', async (status, label) => {
    await render(<MyRequestStatusPill status={status} />);

    expect(screen.getByTestId(`request-status-${status}`)).toBeTruthy();
    expect(screen.getByText(label)).toBeTruthy();
  });
});
