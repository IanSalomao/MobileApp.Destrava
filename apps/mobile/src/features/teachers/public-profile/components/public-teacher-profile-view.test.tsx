import { fireEvent, render, screen } from '@testing-library/react-native';

import type { PublicTeacherProfile } from '../types';
import { PublicTeacherProfileView } from './public-teacher-profile-view';

const profile: PublicTeacherProfile = {
  id: 't1',
  fullName: 'Mariana Silva',
  avatarUrl: null,
  bio: 'Reforço de matemática.',
  hourlyRateCents: 6500,
  tutoringTypes: ['online', 'in_person'],
  educationLevels: ['high_school'],
  weekdays: [1, 3],
  periods: ['morning'],
  neighborhood: 'Centro',
  cityName: 'São Paulo',
  state: 'SP',
  subjects: [{ id: 'math', name: 'Matemática' }],
  languages: [{ id: 'english', name: 'Inglês' }],
  ratingAverage: 4.8,
  ratingCount: 12,
};

describe('PublicTeacherProfileView', () => {
  it('mostra os dados públicos do professor', async () => {
    await render(
      <PublicTeacherProfileView
        profile={profile}
        onRequestContact={jest.fn()}
        onSeeReviews={jest.fn()}
      />,
    );

    expect(screen.getByText('Mariana Silva')).toBeTruthy();
    expect(screen.getByText('Verificado')).toBeTruthy();
    expect(screen.getByText('Centro · São Paulo/SP')).toBeTruthy();
    expect(screen.getByText('R$ 65/h')).toBeTruthy();
    expect(screen.getByText('4.8')).toBeTruthy();
    expect(screen.getByText('12 avaliações')).toBeTruthy();
    expect(screen.getByText('Reforço de matemática.')).toBeTruthy();
    expect(screen.getByText('Matemática')).toBeTruthy();
    expect(screen.getByText('Inglês')).toBeTruthy();
    expect(screen.getByText('Seg')).toBeTruthy();
    expect(screen.getByText('Períodos: Manhã')).toBeTruthy();
  });

  it('avisa que o contato só é liberado depois do aceite', async () => {
    await render(
      <PublicTeacherProfileView
        profile={profile}
        onRequestContact={jest.fn()}
        onSeeReviews={jest.fn()}
      />,
    );

    expect(screen.getByText(/só aparecem depois que ele aceitar/)).toBeTruthy();
  });

  it('chama as ações de solicitar contato e ver avaliações', async () => {
    const onRequestContact = jest.fn();
    const onSeeReviews = jest.fn();
    await render(
      <PublicTeacherProfileView
        profile={profile}
        onRequestContact={onRequestContact}
        onSeeReviews={onSeeReviews}
      />,
    );

    await fireEvent.press(screen.getByText('Solicitar contato'));
    await fireEvent.press(screen.getByText('Ver todas as avaliações'));

    expect(onRequestContact).toHaveBeenCalledTimes(1);
    expect(onSeeReviews).toHaveBeenCalledTimes(1);
  });

  it('mostra "Novo" e esconde "Ver todas" quando não há avaliações', async () => {
    await render(
      <PublicTeacherProfileView
        profile={{
          ...profile,
          ratingAverage: null,
          ratingCount: 0,
          bio: null,
          hourlyRateCents: null,
        }}
        onRequestContact={jest.fn()}
        onSeeReviews={jest.fn()}
      />,
    );

    expect(screen.getByText('Novo')).toBeTruthy();
    expect(screen.getByText('Ainda sem avaliações')).toBeTruthy();
    expect(screen.getByText('Valor a combinar')).toBeTruthy();
    expect(screen.queryByText('Ver todas as avaliações')).toBeNull();
    expect(screen.queryByText('Sobre')).toBeNull();
  });
});
