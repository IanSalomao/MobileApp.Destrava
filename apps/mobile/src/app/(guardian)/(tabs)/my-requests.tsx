import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Text } from '@/components/ui/text';
import { EmptyReceivedRequests } from '@/features/contact-requests/components/empty-received-requests';
import { MyRequestCard } from '@/features/contact-requests/guardian/my-requests/components/my-request-card';
import {
  countPending,
  EMPTY_COPY,
  filterMyRequests,
  getDisplayStatus,
  REQUEST_FILTERS,
} from '@/features/contact-requests/guardian/my-requests/domain';
import {
  useMyContactRequests,
  useOpenTeacherWhatsApp,
} from '@/features/contact-requests/guardian/my-requests/hooks';
import type { MyRequestFilter } from '@/features/contact-requests/guardian/my-requests/types';
import { colors, spacing } from '@/theme';

function openRequest(id: string) {
  router.push({ pathname: '/my-requests/[id]', params: { id } });
}

// Minhas solicitações: status de cada pedido e botão do WhatsApp nas aceitas (RF10, RF14).
// Protótipo: "TODOS OS CHATS", que virou esta lista.
export default function MyRequestsScreen() {
  const query = useMyContactRequests();
  const whatsapp = useOpenTeacherWhatsApp();
  const [filter, setFilter] = useState<MyRequestFilter>('all');

  const visibleRequests = useMemo(
    () => filterMyRequests(query.data ?? [], filter),
    [query.data, filter],
  );
  const pendingCount = useMemo(() => countPending(query.data ?? []), [query.data]);
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
          Não foi possível carregar as solicitações
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
        {REQUEST_FILTERS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={filter === item.key}
            badgeCount={item.key === 'pending' ? pendingCount : undefined}
            onPress={() => setFilter(item.key)}
          />
        ))}
      </ScrollView>

      {whatsapp.errorMessage ? (
        <Banner
          variant="danger"
          title="WhatsApp"
          description={whatsapp.errorMessage}
          style={styles.banner}
        />
      ) : null}

      <FlatList
        style={styles.list}
        data={visibleRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MyRequestCard
            request={item}
            status={getDisplayStatus(item)}
            onPress={() => openRequest(item.id)}
            onOpenWhatsApp={() => void whatsapp.open(item)}
            testID={`my-request-${item.id}`}
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
  banner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
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
