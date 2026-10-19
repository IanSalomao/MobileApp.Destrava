import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { SubjectsList } from '@/features/subjects/components/subjects-list';
import { colors, radius, spacing } from '@/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <Text variant="title">Reforço escolar perto de você</Text>
      <Text color="textMuted">
        Encontre professores verificados na sua região, compare avaliações e peça contato com
        segurança.
      </Text>

      <View style={styles.section}>
        <Text variant="label">Matérias com reforço</Text>
        <SubjectsList />
      </View>

      <View style={styles.placeholder}>
        <Ionicons name="location-outline" size={32} color={colors.primary} />
        <Text variant="label">Busca de professores</Text>
        <Text variant="caption" color="textMuted" style={styles.center}>
          Em breve você vai poder buscar por matéria, valor e distância.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  placeholder: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  center: {
    textAlign: 'center',
  },
});
