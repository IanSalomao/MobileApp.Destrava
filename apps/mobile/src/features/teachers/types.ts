import type { Enums } from '@/lib/database.types';

export type VerificationStatus = Enums<'verification_status'>;
export type SocialNetwork = Enums<'social_network'>;

export type SocialLink = { network: SocialNetwork; url: string };

// Perfil profissional do próprio professor, como ele mesmo vê (inclui o que é privado: CPF,
// situação da verificação, documentos enviados e links de rede social). Base da edição do perfil
// (RF01, RF11) e da prévia em "Meu perfil".
export type MyTeacherProfile = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  hourlyRateCents: number | null;
  tutoringTypes: Enums<'tutoring_type'>[];
  weekdays: number[];
  periods: Enums<'day_period'>[];
  state: Enums<'brazilian_state'> | null;
  cityId: number | null;
  cityName: string | null;
  neighborhood: string | null;
  isPublished: boolean;
  ratingAverage: number | null;
  ratingCount: number;
  subjects: { id: string; name: string }[];
  languages: { id: string; name: string }[];
  socialLinks: SocialLink[];
  verificationStatus: VerificationStatus;
  /** Só dígitos. Nulo enquanto o professor não informou. */
  cpf: string | null;
  identityDocumentName: string | null;
  certificateNames: string[];
};
