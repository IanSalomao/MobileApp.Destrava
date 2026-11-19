import type { SchoolGrade } from '@/features/catalog/types';

// Aluno (filho) como a tela de cadastro e edição o lê: só o que o formulário edita. Dados de
// menor: o banco só entrega ao próprio responsável (LGPD).
export type StudentDetail = Readonly<{
  id: string;
  fullName: string;
  schoolGrade: SchoolGrade;
  learningGoal: string | null;
  subjectIds: readonly string[];
}>;
