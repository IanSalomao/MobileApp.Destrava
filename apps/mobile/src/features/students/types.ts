import type { Enums } from '@/lib/database.types';

// Aluno (filho) do responsável, no formato que as telas usam. Dado de menor: só o próprio
// responsável lê (LGPD), então nada daqui sai do aparelho dele, a não ser a cópia enviada no
// formulário de contato.
export type StudentSummary = Readonly<{
  id: string;
  fullName: string;
  schoolGrade: Enums<'school_grade'>;
  preferredTutoringType: Enums<'tutoring_type'> | null;
}>;