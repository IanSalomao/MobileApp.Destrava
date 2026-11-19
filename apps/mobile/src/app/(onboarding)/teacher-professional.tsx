import { router } from 'expo-router';

import { TEACHER_HOME } from '@/features/auth/route-access';
import { TeacherProfileForm } from '@/features/teachers/components/teacher-profile-form';
import { useTeacherProfileForm } from '@/features/teachers/hooks';

// Cadastro profissional do onboarding (RF01, RF02): 3 etapas e "Enviar para análise".
export default function TeacherProfessionalScreen() {
  const vm = useTeacherProfileForm(() => router.replace(TEACHER_HOME));
  return <TeacherProfileForm vm={vm} />;
}
