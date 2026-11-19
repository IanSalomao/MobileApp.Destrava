import { fireEvent, render, screen } from '@testing-library/react-native';

import type { PublicTeacherProfile } from '../types';
import { PublicTeacherProfileView } from './public-teacher-profile-view';

// Estados do contato no perfil do professor: pendente e aceito ("DEPOIS DE ACEITAR", RF09–RF12).
const profile: PublicTeacherProfile = {
  id: 't1',
  fullName: 'Ana Ribeiro',
  avatarUrl: null,
  bio: null,
  hourlyRateCents: 6500,
  tutoringTypes: ['online'],
  educationLevels: [],
  weekdays: [],
  periods: [],
  neighborhood: null,
  cityName: null,
  state: null,
  subjects: [],
  languages: [],
  ratingAverage: null,
  ratingCount: 0,
};

describe('PublicTeacherProfileView: contato', () => {
  it('com pedido pendente, leva ao pedido em vez de pedir de novo', async () => {
    const onSeeRequest = jest.fn();
    await render(
      <PublicTeacherProfileView
        profile={profile}
        onRequestContact={jest.fn()}
        onSeeReviews={jest.fn()}
        contact={{ status: 'pending', requestId: 'r1' }}
        onSeeRequest={onSeeRequest}
      />,
    );

    expect(screen.queryByText('Solicitar contato')).toBeNull();
    await fireEvent.press(screen.getByText('Solicitação enviada: ver pedido'));
    expect(onSeeRequest).toHaveBeenCalledWith('r1');
  });

  it('com pedido aceito, libera rede social, WhatsApp e avaliação', async () => {
    const onOpenWhatsApp = jest.fn();
    const onOpenSocialLink = jest.fn();
    const onWriteReview = jest.fn();
    await render(
      <PublicTeacherProfileView
        profile={profile}
        onRequestContact={jest.fn()}
        onSeeReviews={jest.fn()}
        contact={{
          status: 'accepted',
          requestId: 'r1',
          phone: '+5511999991234',
          socialLinks: [{ network: 'instagram', url: 'https://instagram.com/profa.ana' }],
        }}
        onOpenWhatsApp={onOpenWhatsApp}
        onOpenSocialLink={onOpenSocialLink}
        onWriteReview={onWriteReview}
        contactError="Não foi possível abrir o link."
      />,
    );

    expect(screen.getByText('Contato liberado')).toBeTruthy();
    expect(screen.getByText('Não foi possível abrir o link.')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Abrir Instagram'));
    expect(onOpenSocialLink).toHaveBeenCalledWith('https://instagram.com/profa.ana');
    await fireEvent.press(screen.getByText('Conversar no WhatsApp'));
    expect(onOpenWhatsApp).toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Avaliar professor'));
    expect(onWriteReview).toHaveBeenCalled();
  });

  it('aceito sem celular nem rede social avisa o responsável', async () => {
    await render(
      <PublicTeacherProfileView
        profile={profile}
        onRequestContact={jest.fn()}
        onSeeReviews={jest.fn()}
        contact={{ status: 'accepted', requestId: 'r1', phone: null, socialLinks: [] }}
      />,
    );

    expect(screen.getByText('O professor ainda não cadastrou uma rede social.')).toBeTruthy();
    expect(screen.getByText('O professor ainda não cadastrou o WhatsApp.')).toBeTruthy();
  });
});
