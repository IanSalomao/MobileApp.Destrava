import { ActivityIndicator, FlatList, StyleSheet, View, type FlatListProps } from 'react-native';

import { colors, spacing } from '@/theme';

import { Button } from './button';
import { Text } from './text';

export type DataListProps<ItemT> = Omit<FlatListProps<ItemT>, 'ListEmptyComponent'> & {
  loading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function DataList<ItemT>({
  data,
  loading = false,
  errorMessage = null,
  onRetry,
  emptyTitle = 'Nenhum resultado encontrado',
  emptyDescription = 'Não há itens para exibir no momento.',
  contentContainerStyle,
  ...rest
}: DataListProps<ItemT>) {
  const isEmpty = !data || data.length === 0;

  if (loading && isEmpty) {
    return (
      <View testID="datalist-loading" style={styles.stateContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text color="textMuted">Carregando...</Text>
      </View>
    );
  }

  if (errorMessage && isEmpty) {
    return (
      <View testID="datalist-error" style={styles.stateContainer}>
        <Text variant="subtitle" color="danger">
          Ops, algo deu errado
        </Text>
        <Text color="textMuted" style={styles.centerText}>
          {errorMessage}
        </Text>
        {onRetry ? <Button title="Tentar novamente" variant="secondary" onPress={onRetry} /> : null}
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      ListEmptyComponent={
        <View testID="datalist-empty" style={styles.stateContainer}>
          <Text variant="subtitle" style={styles.centerText}>
            {emptyTitle}
          </Text>
          <Text color="textMuted" style={styles.centerText}>
            {emptyDescription}
          </Text>
        </View>
      }
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  stateContainer: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  centerText: {
    textAlign: 'center',
  },
});
