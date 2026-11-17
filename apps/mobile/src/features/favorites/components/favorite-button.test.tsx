import { fireEvent, render, screen } from '@testing-library/react-native';

import { FavoriteButton } from './favorite-button';

const mockMutate = jest.fn();
const mockUseFavoriteIds = jest.fn();
const mockUseIsFavorite = jest.fn();

jest.mock('../hooks', () => ({
  useFavoriteIds: () => mockUseFavoriteIds(),
  useIsFavorite: () => mockUseIsFavorite(),
  useToggleFavorite: () => ({ mutate: mockMutate }),
}));

describe('FavoriteButton', () => {
  beforeEach(() => {
    mockUseFavoriteIds.mockReturnValue({ isPending: false });
    mockUseIsFavorite.mockReturnValue(false);
  });
  afterEach(() => jest.clearAllMocks());

  it('mostra o coração vazio e favorita ao tocar', async () => {
    await render(<FavoriteButton teacherId="t1" />);

    expect(screen.getByText('♡')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Adicionar aos favoritos'));

    expect(mockMutate).toHaveBeenCalledWith({ teacherId: 't1', isFavorite: false });
  });

  it('mostra o coração cheio e desfavorita ao tocar', async () => {
    mockUseIsFavorite.mockReturnValue(true);
    await render(<FavoriteButton teacherId="t1" />);

    expect(screen.getByText('♥')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Remover dos favoritos'));

    expect(mockMutate).toHaveBeenCalledWith({ teacherId: 't1', isFavorite: true });
  });

  it('fica desabilitado enquanto a lista de favoritos carrega', async () => {
    mockUseFavoriteIds.mockReturnValue({ isPending: true });
    await render(<FavoriteButton teacherId="t1" />);

    await fireEvent.press(screen.getByTestId('favorite-button-t1'));

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
