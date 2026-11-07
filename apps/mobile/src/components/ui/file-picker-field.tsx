import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Text } from './text';

export type FilePickerFieldProps = {
  title: string;
  /** Texto de apoio quando nenhum arquivo foi escolhido (ex.: "RG ou CNH em PDF, JPG ou PNG"). */
  hint?: string;
  /** Nome do arquivo já escolhido; quando presente, substitui o hint. */
  fileName?: string | null;
  onPress: () => void;
  loading?: boolean;
  error?: string;
};

// Linha de upload de documento/certificado (apresentacional). Quem escolhe/envia é a tela/hook.
export function FilePickerField({
  title,
  hint,
  fileName,
  onPress,
  loading = false,
  error,
}: FilePickerFieldProps) {
  const done = Boolean(fileName);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        disabled={loading}
        style={[styles.row, error ? styles.rowError : null]}
      >
        <Ionicons
          name={done ? 'document-text' : 'document-text-outline'}
          size={24}
          color={done ? colors.primary : colors.textMuted}
        />
        <View style={styles.texts}>
          <Text variant="label">{title}</Text>
          {done ? (
            <Text variant="caption" color="primary" numberOfLines={1}>
              {fileName}
            </Text>
          ) : hint ? (
            <Text variant="caption" color="textMuted">
              {hint}
            </Text>
          ) : null}
        </View>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Ionicons
            name={done ? 'checkmark-circle' : 'add'}
            size={done ? 22 : 24}
            color={done ? colors.primary : colors.textMuted}
          />
        )}
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSubtle,
  },
  rowError: {
    borderColor: colors.danger,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
