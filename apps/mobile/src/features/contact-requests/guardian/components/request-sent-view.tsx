import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { spacing } from '@/theme/tokens';

export interface RequestSentViewProps {
  teacherName?: string;
  onTrackRequest: () => void;
  onGoHome: () => void;
}

export function RequestSentView({
  teacherName,
  onTrackRequest,
  onGoHome,
}: RequestSentViewProps) {
  const description = teacherName
    ? `${teacherName} tem até 24 horas para responder.`
    : 'O professor tem até 24 horas para responder.';

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text variant="title" style={styles.title}>
            Solicitação enviada!
          </Text>
          <Text variant="body" color="textMuted" style={styles.description}>
            {description}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button title="Acompanhar solicitação" onPress={onTrackRequest} />
          <Button title="Voltar ao início" variant="secondary" onPress={onGoHome} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
});