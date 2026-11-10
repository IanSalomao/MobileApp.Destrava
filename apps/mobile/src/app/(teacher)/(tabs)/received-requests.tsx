import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Text } from '@/components/ui/text';
import { EmptyReceivedRequests } from '@/features/contact-requests/components/empty-received-requests';
import { ReceivedRequestCard } from '@/features/contact-requests/components/received-request-card';
import { groupReceivedRequest } from '@/features/contact-requests/domain/received-requests';
import { useReceivedContactRequests } from '@/features/contact-requests/hooks';
import type {
  ReceivedContactRequest,
  ReceivedRequestFilter,
} from '@/features/contact-requests/types';
import { colors, spacing } from '@/theme';


const FILTERS: { key: ReceivedRequestFilter; label: string }[] = [
  { key: 'pending', label: 'Pendentes' },
  { key: 'accepted', label: 'Aceitos' },
  { key: 'declined', label: 'Recusados' },
  { key: 'expired', label: 'Expirados' },
];

const EMPTY_COPY: Record<ReceivedRequestFilter, { title: string; description: string }> = {
  pending: {
    title: 'Nenhum pedido por aqui',
    description: 'Novos pedidos de responsáveis aparecerão aqui para você avaliar.',
  },
  accepted: {
    title: 'Nenhum pedido aceito',
    description: 'Os pedidos que você aceitar aparecerão aqui.',
  },
  declined: {
    title: 'Nenhum pedido recusado',
    description: 'Os pedidos que você recusar aparecerão aqui.',
  },
  expired: {
    title: 'Nenhum pedido expirado',
    description: 'Pedidos sem resposta no prazo ou cancelados aparecerão aqui.',
  },
};

function groupRequests(requests: readonly ReceivedContactRequest[]) {
  const groups: Record<ReceivedRequestFilter, ReceivedContactRequest[]> = {
    pending: [],
    accepted: [],
    declined: [],
    expired: [],
  };
  const now = new Date();

  for (const request of requests) {
    groups[groupReceivedRequest(request, now)].push(request);
  }

  return groups;
}

function openRequest(id: string) {
  router.push({ pathname: '/received-requests/[id]', params: { id } });
}

export default function ReceivedRequestsScreen() {
  const query = useReceivedContactRequests();
  const [filter, setFilter] = useState<ReceivedRequestFilter>('pending');

  const groups = useMemo(() => groupRequests(query.data ?? []), [query.data]);
  const visibleRequests = groups[filter];
  const emptyCopy = EMPTY_COPY[filter];

  if (query.isPending) {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text color="textMuted">Carregando...</Text>
      </View>
    );
  }

  if (query.isError) {
    return (
      <View style={styles.state}>
        <Text variant="subtitle" color="danger">
          Não foi possível carregar os pedidos
        </Text>
        <Button title="Tentar novamente" variant="secondary" onPress={() => query.refetch()} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        horizontal
        style={styles.filtersScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={filter === item.key}
            badgeCount={item.key === 'pending' ? groups.pending.length : undefined}
            onPress={() => setFilter(item.key)}
          />
        ))}
      </ScrollView>

      <FlatList
        style={styles.list}
        data={visibleRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReceivedRequestCard
            request={item}
            isNew={filter === 'pending'}
            onPress={() => openRequest(item.id)}
            testID={`received-request-${item.id}`}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <EmptyReceivedRequests title={emptyCopy.title} description={emptyCopy.description} />
          </View>
        }
        refreshing={query.isRefetching}
        onRefresh={() => query.refetch()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundSubtle,
  },
  filtersScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  empty: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  separator: {
    height: spacing.sm,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.backgroundSubtle,
  },
});
