import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TeacherCard } from '@/components/ui/teacher-card';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { useSubjects } from '@/features/catalog/hooks';
import { normalizeText } from '@/features/teacher-search/domain/neighborhood-escalation';
import { useHomeTeachers, useTeacherSearchState } from '@/features/teacher-search/hooks';
import type { TeacherSearchResultRow } from '@/features/teacher-search/types';
import { colors, layout, radius, spacing } from '@/theme';

export default function GuardianHomeScreen() {
  const { location, filters, activeFilterCount, setLocation, setFilters } = useTeacherSearchState();

  const subjectsQuery = useSubjects();
  const homeTeachers = useHomeTeachers();

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

  function handleSearchSubmit() {
    router.push('/search');
  }

  function handleSelectSubject(subjectId: string) {
    setFilters({ subjectIds: [subjectId] });
    router.push('/search');
  }

  function toggleQuickNeighborhood(neighborhood: string) {
    const exists = location.neighborhoods.includes(neighborhood);
    setLocation({
      neighborhoods: exists
        ? location.neighborhoods.filter((n) => n !== neighborhood)
        : [...location.neighborhoods, neighborhood],
    });
  }

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
        data={homeTeachers.teachers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Barra superior: Localização + Notificações */}
            <View style={styles.topBar}>
              <View style={styles.locationInfo}>
                <Text variant="caption" color="textMuted">
                  Buscando reforço em
                </Text>
                <Text variant="subtitle">
                  {location.cityName}, {location.state}
                </Text>
              </View>

              <View style={styles.topActions}>
                <Pressable
                  testID="change-location-button"
                  accessibilityRole="button"
                  onPress={() => router.push('/search-location')}
                  style={styles.actionPill}
                >
                  <Text variant="label" color="primary">
                    Alterar
                  </Text>
                </Pressable>

                <Pressable
                  testID="notifications-button"
                  accessibilityRole="button"
                  onPress={() => router.push('/notifications')}
                  style={styles.actionPill}
                >
                  <Text variant="caption" color="text">
                    Avisos
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Busca por texto + Botão de Filtros */}
            <View style={styles.searchSection}>
              <TextField
                label="Buscar professor ou matéria"
                placeholder="Ex.: Matemática, Mariana, alfabetização..."
                value={filters.query}
                onChangeText={(text) => setFilters({ query: text })}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />
              <View style={styles.searchButtonsRow}>
                <View style={styles.flexButton}>
                  <Button title="Buscar professores" onPress={handleSearchSubmit} />
                </View>
                <View style={styles.flexButton}>
                  <Button
                    title={activeFilterCount > 0 ? `Filtros (${activeFilterCount})` : 'Filtros'}
                    variant="secondary"
                    onPress={() => router.push('/search-filters')}
                  />
                </View>
              </View>
            </View>

            {/* Atalho de Matérias */}
            <View style={styles.section}>
              <Text variant="subtitle">Matérias</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalRow}
              >
                {(subjectsQuery.data ?? []).map((subject) => (
                  <Pressable
                    key={subject.id}
                    testID={`home-subject-${subject.id}`}
                    accessibilityRole="button"
                    onPress={() => handleSelectSubject(subject.id)}
                    style={styles.chip}
                  >
                    <Text variant="caption" color="primary">
                      {subject.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Escalonamento rápido por Bairros da Cidade */}
            {homeTeachers.availableNeighborhoods.length > 0 ? (
              <View style={styles.section}>
                <Text variant="subtitle">Priorizar bairro em {location.cityName}</Text>
                <Text variant="caption" color="textMuted">
                  Toque no seu bairro para colocar os professores dele no topo, mantendo os demais
                  da cidade abaixo.
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalRow}
                >
                  {homeTeachers.availableNeighborhoods.map((neighborhood) => {
                    const selected = location.neighborhoods.includes(neighborhood);
                    return (
                      <Pressable
                        key={neighborhood}
                        testID={`home-neighborhood-${neighborhood}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => toggleQuickNeighborhood(neighborhood)}
                        style={[styles.chip, selected && styles.chipSelected]}
                      >
                        <Text variant="caption" color={selected ? 'primary' : 'text'}>
                          {neighborhood}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.sectionHeaderRow}>
              <Text variant="subtitle">Professores em {location.cityName}</Text>
              <Pressable accessibilityRole="button" onPress={() => router.push('/search')}>
                <Text variant="label" color="primary">
                  Ver todos
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
          homeTeachers.isLoading ? (
            <View style={styles.emptyBox}>
              <Text color="textMuted">Buscando professores em {location.cityName}...</Text>
            </View>
          ) : homeTeachers.isError ? (
            <View style={styles.emptyBox}>
              <Text color="danger">Não foi possível carregar os professores agora.</Text>
              <Button
                title="Tentar novamente"
                variant="secondary"
                onPress={() => homeTeachers.refetch()}
              />
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text variant="subtitle">Nenhum professor encontrado em {location.cityName}</Text>
              <Text color="textMuted">
                Experimente alterar a cidade para explorar outros professores.
              </Text>
              <Button
                title="Alterar cidade"
                variant="secondary"
                onPress={() => router.push('/search-location')}
              />
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
  headerContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xs,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  locationInfo: {
    flex: 1,
    gap: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionPill: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    gap: spacing.sm,
  },
  searchButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  section: {
    gap: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  horizontalRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  chip: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
  },
  emptyBox: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
});
