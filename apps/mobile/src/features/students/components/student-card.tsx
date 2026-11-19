import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { getInitials } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { SCHOOL_GRADE_LABELS } from '@/features/catalog/types';
import { colors, layout, radius, spacing } from '@/theme';

import type { StudentSummary } from '../types';

export type StudentCardProps = {
  student: Pick<StudentSummary, 'id' | 'fullName' | 'schoolGrade'>;
  onPress: () => void;
};

// Card do aluno no Meu perfil do responsável: iniciais, nome e ano escolar. Abre a edição.
// Protótipo: card "Aluno" do PERFIL RESPONSAVEL.
export function StudentCard({ student, onPress }: StudentCardProps) {
  const gradeLabel = SCHOOL_GRADE_LABELS[student.schoolGrade];

  return (
    <Pressable
      testID={`student-card-${student.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${student.fullName}, ${gradeLabel}`}
      accessibilityHint="Abre os dados do aluno para editar"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.initials}>
        <Text variant="label" color="onPrimary">
          {getInitials(student.fullName)}
        </Text>
      </View>
      <View style={styles.info}>
        <Text variant="label" numberOfLines={1}>
          {student.fullName}
        </Text>
        <Text variant="caption" color="textMuted" numberOfLines={1}>
          {gradeLabel}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text} />
    </Pressable>
  );
}

const INITIALS_SIZE = layout.minTouchTarget;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.92,
  },
  initials: {
    width: INITIALS_SIZE,
    height: INITIALS_SIZE,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
  },
});
