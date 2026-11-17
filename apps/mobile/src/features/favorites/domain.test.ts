import { applyFavoriteToggle, toFavoriteTeachers, type FavoriteRow } from './domain';

describe('applyFavoriteToggle', () => {
  it('adiciona quando ainda não é favorito', () => {
    expect(applyFavoriteToggle(['a'], 'b', false)).toEqual(['a', 'b']);
  });

  it('não repete um id que já está na lista', () => {
    expect(applyFavoriteToggle(['a', 'b'], 'b', false)).toEqual(['a', 'b']);
  });

  it('remove quando já é favorito', () => {
    expect(applyFavoriteToggle(['a', 'b'], 'a', true)).toEqual(['b']);
  });

  it('não altera a lista original', () => {
    const ids = ['a'];
    applyFavoriteToggle(ids, 'b', false);
    expect(ids).toEqual(['a']);
  });
});

const row: FavoriteRow = {
  created_at: '2026-11-10T12:00:00Z',
  teachers: {
    id: 't1',
    hourly_rate_cents: 6500,
    rating_average: 4.8,
    rating_count: 12,
    profiles: { full_name: 'Mariana Alves', avatar_url: 'https://exemplo.com/a.png' },
    teacher_subjects: [
      { subjects: { name: 'Física', sort_order: 2 } },
      { subjects: { name: 'Matemática', sort_order: 1 } },
    ],
  },
};

describe('toFavoriteTeachers', () => {
  it('converte as linhas do banco, com as matérias em ordem', () => {
    expect(toFavoriteTeachers([row])).toEqual([
      {
        id: 't1',
        fullName: 'Mariana Alves',
        avatarUrl: 'https://exemplo.com/a.png',
        subjects: ['Matemática', 'Física'],
        hourlyRateCents: 6500,
        ratingAverage: 4.8,
        ratingCount: 12,
      },
    ]);
  });

  it('descarta favoritos cujo professor não está mais visível', () => {
    expect(toFavoriteTeachers([{ created_at: row.created_at, teachers: null }, row])).toHaveLength(
      1,
    );
  });

  it('lida com dados ausentes', () => {
    const [teacher] = toFavoriteTeachers([
      {
        created_at: row.created_at,
        teachers: {
          id: 't2',
          hourly_rate_cents: null,
          rating_average: null,
          rating_count: 0,
          profiles: null,
          teacher_subjects: [{ subjects: null }],
        },
      },
    ]);

    expect(teacher).toMatchObject({
      fullName: 'Professor',
      avatarUrl: null,
      subjects: [],
      hourlyRateCents: 0,
      ratingAverage: null,
    });
  });
});
