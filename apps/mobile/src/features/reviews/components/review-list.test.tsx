import { render, screen } from '@testing-library/react-native';

import type { Review } from '../types';
import { ReviewCard } from './review-card';
import { ReviewSummary } from './review-summary';

const review: Review = {
  id: 'r1',
  teacherId: 't1',
  rating: 4,
  comment: 'Meu filho melhorou muito em frações.',
  reviewerName: 'Camila S.',
  createdAt: '2026-11-18T15:00:00Z',
  updatedAt: '2026-11-18T15:00:00Z',
};

describe('lista de avaliações', () => {
  it('ReviewCard mostra nome exibido, estrelas e comentário', async () => {
    await render(<ReviewCard review={review} />);

    expect(screen.getByText('Camila S.')).toBeTruthy();
    expect(screen.getByLabelText('Nota 4 de 5')).toBeTruthy();
    expect(screen.getByText('★★★★☆')).toBeTruthy();
    expect(screen.getByText('Meu filho melhorou muito em frações.')).toBeTruthy();
  });

  it('ReviewCard sem comentário mostra só a nota', async () => {
    await render(<ReviewCard review={{ ...review, comment: null }} />);
    expect(screen.queryByText('Meu filho melhorou muito em frações.')).toBeNull();
  });

  it('ReviewSummary mostra média e total', async () => {
    await render(<ReviewSummary teacherName="Ana" average={4.86} count={12} />);

    expect(screen.getByText('Avaliações de Ana')).toBeTruthy();
    expect(screen.getByText('4,9')).toBeTruthy();
    expect(screen.getByText('12 avaliações')).toBeTruthy();
  });
});
