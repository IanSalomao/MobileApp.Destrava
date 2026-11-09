import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors, radius, spacing } from '@/theme';

import { useSubjects } from '../hooks';

// Componente de apresentação (View): só usa o hook da feature e renderiza.
// Nada de chamada ao Supabase nem regra de negócio aqui.

/** Mostra as matérias do catálogo como chips. */
export function SubjectsList() {
  const { data: subjects, isPending, isError } = useSubjects();

  if (isPending) {
    return <ActivityIndicator color={colors.primary} />;
  }

  if (isError) {
    return <Text color="danger">Não foi possível carregar as matérias.</Text>;
  }

  return (
    <View style={styles.list}>
      {subjects.map((subject) => (
        <View key={subject.id} style={styles.chip}>
          <Text variant="caption" color="primary">
            {subject.name}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
  },
});
