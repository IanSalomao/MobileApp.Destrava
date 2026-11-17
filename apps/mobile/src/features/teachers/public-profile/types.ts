import type { Enums } from '@/lib/database.types';

export type TutoringType = Enums<'tutoring_type'>;
export type EducationLevel = Enums<'education_level'>;
export type DayPeriod = Enums<'day_period'>;
export type BrazilianState = Enums<'brazilian_state'>;

export type NamedItem = { id: string; name: string };

// Perfil público do professor, como o responsável vê (RF03, RF06). Não traz nada de contato:
// WhatsApp e rede social só existem depois do aceite (RF09, RF11) e vêm de outra consulta.
export type PublicTeacherProfile = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  hourlyRateCents: number | null;
  tutoringTypes: TutoringType[];
  educationLevels: EducationLevel[];
  weekdays: number[];
  periods: DayPeriod[];
  neighborhood: string | null;
  cityName: string | null;
  state: BrazilianState | null;
  subjects: NamedItem[];
  languages: NamedItem[];
  /** Nula enquanto o professor não tiver avaliações. */
  ratingAverage: number | null;
  ratingCount: number;
};
