import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Banner } from './banner';

describe('UI-02a: Banner', () => {
  it('renderiza o título padrão "Contato seguro" e a descrição informativa', async () => {
    await render(
      <Banner description="Após aceitar, o WhatsApp e seus dados profissionais serão liberados." />,
    );

    expect(screen.getByText('Contato seguro')).toBeTruthy();
    expect(
      screen.getByText('Após aceitar, o WhatsApp e seus dados profissionais serão liberados.'),
    ).toBeTruthy();
  });

  it('permite título customizado e variantes semânticas', async () => {
    await render(
      <Banner
        variant="success"
        title="Perfil profissional ativo"
        description="Sua assinatura está ativa e seu perfil está visível."
      />,
    );

    expect(screen.getByText('Perfil profissional ativo')).toBeTruthy();
    expect(screen.getByText('Sua assinatura está ativa e seu perfil está visível.')).toBeTruthy();
  });
});
