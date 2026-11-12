import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { useLanguages, useSubjects } from '@/features/catalog/hooks';
import { useAvailableNeighborhoods, useTeacherSearchState } from '@/features/teacher-search/hooks';
import type { TutoringType } from '@/features/teacher-search/types';
import { colors, layout, radius, spacing } from '@/theme';

const TUTORING_TYPE_OPTIONS: { id: TutoringType; label: string }[] = [
  { id: 'in_person', label: 'Presencial' },
  { id: 'online', label: 'Online' },
];

const WEEKDAY_OPTIONS: { day: number; label: string }[] = [
  { day: 1, label: 'Seg' },
  { day: 2, label: 'Ter' },
  { day: 3, label: 'Qua' },
  { day: 4, label: 'Qui' },
  { day: 5, label: 'Sex' },
  { day: 6, label: 'Sáb' },
  { day: 0, label: 'Dom' },
];

export default function SearchFiltersScreen() {
  const { location, filters, setLocation, setFilters, resetFilters } = useTeacherSearchState();

  const subjectsQuery = useSubjects();
  const languagesQuery = useLanguages();
  const neighborhoodsQuery = useAvailableNeighborhoods(location.cityId, location.state);

  const [subjectIds, setSubjectIds] = useState<string[]>(filters.subjectIds);
  const [languageIds, setLanguageIds] = useState<string[]>(filters.languageIds);
  const [tutoringTypes, setTutoringTypes] = useState<TutoringType[]>(filters.tutoringTypes);
  const [weekdays, setWeekdays] = useState<number[]>(filters.weekdays);
  const [neighborhoods, setNeighborhoods] = useState<string[]>(location.neighborhoods);
  const [neighborhoodMode, setNeighborhoodMode] = useState<'prioritize' | 'strict'>(
    filters.neighborhoodMode,
  );
  const [maxPriceReais, setMaxPriceReais] = useState<string>(
    filters.maxHourlyRateCents ? String(Math.round(filters.maxHourlyRateCents / 100)) : '',
  );

  function toggleItem<T>(list: T[], value: T, setter: (next: T[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function handleApply() {
    const parsedMax = Number(maxPriceReais.replace(/\D/g, ''));
    setLocation({ neighborhoods });
    setFilters({
      subjectIds,
      languageIds,
      tutoringTypes,
      weekdays,
      neighborhoodMode,
      maxHourlyRateCents: parsedMax > 0 ? parsedMax * 100 : null,
    });
    router.dismissTo('/search');
  }

  function handleClear() {
    resetFilters();
    setSubjectIds([]);
    setLanguageIds([]);
    setTutoringTypes([]);
    setWeekdays([]);
    setNeighborhoods([]);
    setNeighborhoodMode('prioritize');
    setMaxPriceReais('');
  }

  function handleGoBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  const availableNeighborhoods = neighborhoodsQuery.data ?? [];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.navBar}>
          <Pressable
            testID="back-from-filters-button"
            accessibilityRole="button"
            onPress={handleGoBack}
            style={styles.chip}
          >
            <Text variant="label" color="primary">
              ← Voltar
            </Text>
          </Pressable>
        </View>
        <Text variant="title">Filtros de busca</Text>

        {/* Bairros da cidade atual */}
        {availableNeighborhoods.length > 0 ? (
          <View style={styles.section}>
            <Text variant="subtitle">Bairros disponíveis em {location.cityName}</Text>
            <View style={styles.chipsWrap}>
              {availableNeighborhoods.map((neighborhood) => {
                const selected = neighborhoods.includes(neighborhood);
                return (
                  <Pressable
                    key={neighborhood}
                    testID={`filter-neighborhood-${neighborhood}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => toggleItem(neighborhoods, neighborhood, setNeighborhoods)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text variant="caption" color={selected ? 'primary' : 'text'}>
                      {neighborhood}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {neighborhoods.length > 0 ? (
              <View style={styles.chipsWrap}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: neighborhoodMode === 'prioritize',
                  }}
                  onPress={() => setNeighborhoodMode('prioritize')}
                  style={[styles.chip, neighborhoodMode === 'prioritize' && styles.chipSelected]}
                >
                  <Text
                    variant="caption"
                    color={neighborhoodMode === 'prioritize' ? 'primary' : 'text'}
                  >
                    Escalonar (bairro primeiro, depois cidade)
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: neighborhoodMode === 'strict',
                  }}
                  onPress={() => setNeighborhoodMode('strict')}
                  style={[styles.chip, neighborhoodMode === 'strict' && styles.chipSelected]}
                >
                  <Text
                    variant="caption"
                    color={neighborhoodMode === 'strict' ? 'primary' : 'text'}
                  >
                    Apenas deste(s) bairro(s)
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Tipo de reforço */}
        <View style={styles.section}>
          <Text variant="subtitle">Modalidade da aula</Text>
          <View style={styles.chipsWrap}>
            {TUTORING_TYPE_OPTIONS.map((option) => {
              const selected = tutoringTypes.includes(option.id);
              return (
                <Pressable
                  key={option.id}
                  testID={`filter-tutoring-${option.id}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => toggleItem(tutoringTypes, option.id, setTutoringTypes)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text variant="caption" color={selected ? 'primary' : 'text'}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Valor máximo por hora */}
        <View style={styles.section}>
          <Text variant="subtitle">Valor máximo por hora (R$)</Text>
          <TextField
            label="Até R$/hora"
            placeholder="Ex.: 80"
            keyboardType="numeric"
            value={maxPriceReais}
            onChangeText={setMaxPriceReais}
          />
        </View>

        {/* Matérias */}
        <View style={styles.section}>
          <Text variant="subtitle">Matérias</Text>
          <View style={styles.chipsWrap}>
            {(subjectsQuery.data ?? []).map((subject) => {
              const selected = subjectIds.includes(subject.id);
              return (
                <Pressable
                  key={subject.id}
                  testID={`filter-subject-${subject.id}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => toggleItem(subjectIds, subject.id, setSubjectIds)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text variant="caption" color={selected ? 'primary' : 'text'}>
                    {subject.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Idiomas */}
        <View style={styles.section}>
          <Text variant="subtitle">Idiomas</Text>
          <View style={styles.chipsWrap}>
            {(languagesQuery.data ?? []).map((language) => {
              const selected = languageIds.includes(language.id);
              return (
                <Pressable
                  key={language.id}
                  testID={`filter-language-${language.id}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => toggleItem(languageIds, language.id, setLanguageIds)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text variant="caption" color={selected ? 'primary' : 'text'}>
                    {language.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Dias disponíveis */}
        <View style={styles.section}>
          <Text variant="subtitle">Dias disponíveis</Text>
          <View style={styles.chipsWrap}>
            {WEEKDAY_OPTIONS.map((item) => {
              const selected = weekdays.includes(item.day);
              return (
                <Pressable
                  key={item.day}
                  testID={`filter-weekday-${item.day}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => toggleItem(weekdays, item.day, setWeekdays)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text variant="caption" color={selected ? 'primary' : 'text'}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.actions}>
          <Button title="Ver professores" onPress={handleApply} />
          <Button title="Limpar filtros" variant="ghost" onPress={handleClear} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
  navBar: { flexDirection: 'row', alignItems: 'center' },
  actions: {
    gap: spacing.sm,
  },
});
