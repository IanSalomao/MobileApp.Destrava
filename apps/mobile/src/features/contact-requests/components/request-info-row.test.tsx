import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { RequestInfoRow } from './request-info-row';

describe('RequestInfoRow', () => {
  it('mostra o rótulo e o valor da informação', async () => {
    await render(
      <RequestInfoRow icon="person-outline" label="Aluno" value="Gabriel Martins, 12 anos" />,
    );

    expect(screen.getByText('Aluno')).toBeTruthy();
    expect(screen.getByText('Gabriel Martins, 12 anos')).toBeTruthy();
  });
});
