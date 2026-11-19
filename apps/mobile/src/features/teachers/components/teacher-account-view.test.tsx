import { fireEvent, render, screen } from '@testing-library/react-native';

import type { MyTeacherProfile } from '../types';
import { TeacherAccountView } from './teacher-account-view';

const profile: MyTeacherProfile = {
  id: 't1',
  fullName: 'Mariana Alves',
  avatarUrl: null,
  bio: 'Professora há 8 anos.',
  hourlyRateCents: 6500,
  tutoringTypes: ['online', 'in_person'],
  weekdays: [1],
  periods: ['morning'],
  state: 'SP',
  cityId: 3550308,
  cityName: 'São Paulo',
  isPublished: true,
  ratingAverage: 4.9,
  ratingCount: 12,
  subjects: [{ id: 'math', name: 'Matemática' }],
  languages: [{ id: 'pt', name: 'Português' }],
  socialLinks: [{ network: 'instagram', url: 'https://instagram.com/profa.mariana' }],
  verificationStatus: 'approved',
  cpf: '52998224725',
  identityDocumentName: 'rg.pdf',
  certificateNames: [],
};

function renderView(overrides: Partial<MyTeacherProfile> = {}) {
  const handlers = {
    onEditProfile: jest.fn(),
    onSeeReviews: jest.fn(),
    onOpenSettings: jest.fn(),
    onSignOut: jest.fn(),
  };
  return {
    handlers,
    rendered: render(<TeacherAccountView profile={{ ...profile, ...overrides }} {...handlers} />),
  };
}

describe('TeacherAccountView', () => {
  it('mostra a prévia do perfil e a situação na busca', async () => {
    await renderView().rendered;

    expect(screen.getByText('Mariana Alves')).toBeTruthy();
    expect(screen.getByText('Perfil verificado')).toBeTruthy();
    expect(screen.getByText('São Paulo/SP')).toBeTruthy();
    expect(screen.getByText('Seu perfil aparece nas buscas das famílias.')).toBeTruthy();
    expect(screen.getByText('4,9')).toBeTruthy();
    expect(screen.getByText('R$ 65/h')).toBeTruthy();
    expect(screen.getByText('Matemática')).toBeTruthy();
    expect(
      screen.getByText('Instagram: instagram.com/profa.mariana (liberado após o aceite)'),
    ).toBeTruthy();
  });

  it('avisa quando o perfil está fora das buscas e falta preencher dados', async () => {
    await renderView({
      isPublished: false,
      verificationStatus: 'draft',
      bio: null,
      hourlyRateCents: null,
      ratingAverage: null,
      socialLinks: [],
      cityName: null,
      state: null,
    }).rendered;

    expect(screen.getByText('Cadastro incompleto')).toBeTruthy();
    expect(screen.getByText(/fora das buscas/)).toBeTruthy();
    expect(screen.getByText('Você ainda não escreveu sobre suas aulas.')).toBeTruthy();
    expect(screen.getByText('Sem rede social cadastrada.')).toBeTruthy();
  });

  it('o menu leva à edição, às avaliações, às configurações e sai da conta', async () => {
    const { handlers, rendered } = renderView();
    await rendered;

    await fireEvent.press(screen.getByLabelText('Editar perfil'));
    await fireEvent.press(screen.getByLabelText('Avaliações recebidas'));
    await fireEvent.press(screen.getByLabelText('Configurações'));
    await fireEvent.press(screen.getByLabelText('Sair da conta'));

    expect(handlers.onEditProfile).toHaveBeenCalled();
    expect(handlers.onSeeReviews).toHaveBeenCalled();
    expect(handlers.onOpenSettings).toHaveBeenCalled();
    expect(handlers.onSignOut).toHaveBeenCalled();
  });
});
