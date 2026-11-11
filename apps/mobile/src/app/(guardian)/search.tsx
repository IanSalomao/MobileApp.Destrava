import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TeacherCard } from '@/components/ui/teacher-card';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { useSubjects } from '@/features/catalog/hooks';
import { normalizeText } from '@/features/teacher-search/domain/neighborhood-escalation';
import { useInfiniteTeacherSearch, useTeacherSearchState } from '@/features/teacher-search/hooks';
import type { TeacherSearchResultRow } from '@/features/teacher-search/types';
import { colors, layout, radius, spacing } from '@/theme';

export default function SearchResultsScreen() {
  const { location, filters, activeFilterCount, setFilters, resetFilters } =
    useTeacherSearchState();

  const subjectsQuery = useSubjects();
  const searchQuery = useInfiniteTeacherSearch();

  const subjectMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of subjectsQuery.data ?? []) {
      map.set(s.id, s.name);
    }
    return map;
  }, [subjectsQuery.data]);

  const normalizedSelectedNeighborhoods = useMemo(
    () => new Set(location.neighborhoods.map(normalizeText)),
    [location.neighborhoods],
  );

  function formatLocationLabel(teacher: TeacherSearchResultRow): string {
    const isPrioritized =
      teacher.neighborhood &&
      normalizedSelectedNeighborhoods.has(normalizeText(teacher.neighborhood));

    if (teacher.neighborhood && isPrioritized) {
      return `${teacher.neighborhood} (seu bairro) • ${teacher.city_name}`;
    }
    if (teacher.neighborhood) {
      return `${teacher.neighborhood} • ${teacher.city_name}`;
    }
    return `${teacher.city_name}, ${teacher.state}`;
  }

  return (
    <Screen>
      <FlatList
        data={searchQuery.teachers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage) {
            searchQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.locationBar}>
              <View style={styles.locationTextWrap}>
                <Text variant="subtitle">
                  {location.cityName}, {location.state}
                </Text>
                {location.neighborhoods.length > 0 ? (
                  <Text variant="caption" color="primary">
                    Priorizando: {location.neighborhoods.join(', ')}
                  </Text>
                ) : (
                  <Text variant="caption" color="textMuted">
                    Todos os bairros da cidade
                  </Text>
                )}
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/search-location')}
                style={styles.pillButton}
              >
                <Text variant="caption" color="primary">
                  Trocar local
                </Text>
              </Pressable>
            </View>

            <TextField
              label="Pesquisar"
              placeholder="Nome, matéria ou assunto..."
              value={filters.query}
              onChangeText={(text) => setFilters({ query: text })}
            />

            <View style={styles.filterRow}>
              <Text variant="caption" color="textMuted">
                {searchQuery.totalCount} professor(es) encontrado(s)
              </Text>

              <Pressable
                testID="open-filters-button"
                accessibilityRole="button"
                onPress={() => router.push('/search-filters')}
                style={styles.pillButton}
              >
                <Text variant="label" color="primary">
                  {activeFilterCount > 0 ? `Filtros (${activeFilterCount})` : 'Filtros'}
                </Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TeacherCard
            id={item.id}
            name={item.full_name}
            avatarUrl={item.avatar_url || null}
            isVerified
            subjects={(item.subject_ids ?? []).map((id) => subjectMap.get(id) ?? id)}
            hourlyRateCents={item.hourly_rate_cents}
            ratingAverage={Number(item.rating_average ?? 0)}
            ratingCount={item.rating_count}
            distanceLabel={formatLocationLabel(item)}
            onPress={() =>
              router.push({
                pathname: '/teachers/[id]',
                params: { id: item.id },
              })
            }
          />
        )}
        ListEmptyComponent={
          searchQuery.isLoading ? (
            <View style={styles.emptyBox}>
              <Text color="textMuted">Carregando resultados...</Text>
            </View>
          ) : searchQuery.isError ? (
            <View style={styles.emptyBox}>
              <Text color="danger">Erro ao buscar professores. Tente novamente.</Text>
              <Button
                title="Tentar novamente"
                variant="secondary"
                onPress={() => searchQuery.refetch()}
              />
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text variant="subtitle">Nenhum professor encontrado</Text>
              <Text color="textMuted">Tente remover alguns filtros ou buscar em outra cidade.</Text>
              <Button title="Limpar filtros" variant="secondary" onPress={resetFilters} />
            </View>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  locationTextWrap: {
    flex: 1,
    gap: 2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillButton: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
});
