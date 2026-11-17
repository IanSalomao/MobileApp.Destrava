// Professor favoritado, no formato que a lista de Favoritos usa (RF03). Só dados públicos: nada de
// contato, que continua liberado apenas depois do aceite (RF09, RF11).
export type FavoriteTeacher = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  subjects: string[];
  hourlyRateCents: number;
  /** Nula enquanto o professor não tiver avaliações. */
  ratingAverage: number | null;
  ratingCount: number;
};

export type ToggleFavoriteVariables = {
  teacherId: string;
  /** Estado atual: true remove dos favoritos, false adiciona. */
  isFavorite: boolean;
};
