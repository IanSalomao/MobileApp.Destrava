import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { WelcomeScreen } from './welcome-screen';

// AUT-01: a tela só dispara navegação. Mockamos o router para verificar a rota
// de destino de cada ação, sem montar a árvore de navegação real.
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }));

const mockPush = router.push as jest.Mock;
const mockReplace = router.replace as jest.Mock;

describe('AUT-01: WelcomeScreen (escolha de perfil)', () => {
  afterEach(() => jest.clearAllMocks());

  it('mostra o título e a pergunta da tela', () => {
    render(<WelcomeScreen />);

    expect(screen.getByText('BEM-VINDO AO DESTRAVA')).toBeTruthy();
    expect(screen.getByText('Como você quer usar o app?')).toBeTruthy();
  });

  it('"Sou pai ou responsável" leva ao cadastro do responsável', () => {
    render(<WelcomeScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Sou pai ou responsável' }));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/sign-up', params: { role: 'guardian' } });
  });

  it('"Sou professor" leva ao cadastro do professor', () => {
    render(<WelcomeScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Sou professor' }));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/sign-up', params: { role: 'teacher' } });
  });

  it('"Entrar" leva ao login', () => {
    render(<WelcomeScreen />);

    fireEvent.press(screen.getByText('Entrar'));

    expect(mockReplace).toHaveBeenCalledWith('/sign-in');
  });
});
