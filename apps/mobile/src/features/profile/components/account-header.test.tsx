import { fireEvent, render, screen } from '@testing-library/react-native';

import { AccountHeader } from './account-header';

describe('AccountHeader', () => {
  it('mostra iniciais, nome e de quem é responsável', async () => {
    await render(
      <AccountHeader
        fullName="Juliana Martins"
        subtitle="Responsável por Gabriel"
        avatarUrl={null}
        isUploading={false}
        onChangePhoto={jest.fn()}
      />,
    );

    expect(screen.getByText('JM')).toBeTruthy();
    expect(screen.getByText('Juliana Martins')).toBeTruthy();
    expect(screen.getByText('Responsável por Gabriel')).toBeTruthy();
  });

  it('a câmera troca a foto', async () => {
    const onChangePhoto = jest.fn();
    await render(
      <AccountHeader
        fullName="Juliana Martins"
        subtitle="Responsável"
        avatarUrl={null}
        isUploading={false}
        onChangePhoto={onChangePhoto}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Trocar foto de perfil' }));

    expect(onChangePhoto).toHaveBeenCalledTimes(1);
  });

  it('enquanto envia, a câmera fica ocupada e não dispara de novo', async () => {
    const onChangePhoto = jest.fn();
    await render(
      <AccountHeader
        fullName="   "
        subtitle="Responsável"
        avatarUrl={null}
        isUploading
        onChangePhoto={onChangePhoto}
      />,
    );

    expect(screen.getByText('Sem nome')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('change-photo-button'));
    expect(onChangePhoto).not.toHaveBeenCalled();
  });
});
