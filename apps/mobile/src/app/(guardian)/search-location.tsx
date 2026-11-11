import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { useCities } from '@/features/catalog/hooks';
import { normalizeText } from '@/features/teacher-search/domain/neighborhood-escalation';
import { useAvailableNeighborhoods, useTeacherSearchState } from '@/features/teacher-search/hooks';
import type { BrazilianState } from '@/features/teacher-search/types';
import { colors, layout, radius, spacing } from '@/theme';

const STATE_OPTIONS: { uf: BrazilianState; name: string }[] = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
];

const MIN_CITY_QUERY_LENGTH = 3;

export default function SearchLocationScreen() {
  const { location, setLocation } = useTeacherSearchState();

  const [selectedState, setSelectedState] = useState<BrazilianState>(location.state);
  const [isStatePickerOpen, setIsStatePickerOpen] = useState(false);

  const [selectedCityId, setSelectedCityId] = useState<number | null>(location.cityId);
  const [selectedCityName, setSelectedCityName] = useState<string>(location.cityName);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [cityQuery, setCityQuery] = useState('');

  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>(
    location.neighborhoods,
  );

  const citiesQuery = useCities(selectedState);
  const neighborhoodsQuery = useAvailableNeighborhoods(selectedCityId ?? 0, selectedState);

  const selectedStateLabel = useMemo(() => {
    const found = STATE_OPTIONS.find((item) => item.uf === selectedState);
    return found ? `${found.name} (${found.uf})` : selectedState;
  }, [selectedState]);

  const normalizedCityQuery = normalizeText(cityQuery);
  const hasMinChars = normalizedCityQuery.length >= MIN_CITY_QUERY_LENGTH;

  const matchingCities = useMemo(() => {
    if (!hasMinChars) return [];
    const list = citiesQuery.data ?? [];
    return list
      .filter((city) => normalizeText(city.name).includes(normalizedCityQuery))
      .slice(0, 15);
  }, [citiesQuery.data, hasMinChars, normalizedCityQuery]);

  function handleSelectState(uf: BrazilianState) {
    setSelectedState(uf);
    setIsStatePickerOpen(false);
    if (uf !== selectedState) {
      setSelectedCityId(null);
      setSelectedCityName('');
      setCityQuery('');
      setIsSearchingCity(true);
      setSelectedNeighborhoods([]);
    }
  }

  function handleSelectCity(city: { id: number; name: string }) {
    setSelectedCityId(city.id);
    setSelectedCityName(city.name);
    setCityQuery('');
    setIsSearchingCity(false);
    setSelectedNeighborhoods([]);
  }

  function toggleNeighborhood(neighborhood: string) {
    setSelectedNeighborhoods((prev) =>
      prev.includes(neighborhood)
        ? prev.filter((item) => item !== neighborhood)
        : [...prev, neighborhood],
    );
  }

  function handleApplyLocation() {
    if (!selectedCityId || !selectedCityName) return;

    setLocation({
      state: selectedState,
      cityId: selectedCityId,
      cityName: selectedCityName,
      neighborhoods: selectedNeighborhoods,
    });
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
        <Text variant="title">Onde buscar professores?</Text>
        <Text color="textMuted">
          Escolha o estado e a cidade. Se quiser, selecione seu bairro para ver primeiro os
          professores mais próximos de você.
        </Text>

        {/* 1. Estado (UF) — Campo Clicável (Dropdown) */}
        <View style={styles.section}>
          <Text variant="subtitle">1. Estado (UF)</Text>

          <Pressable
            testID="state-selector-trigger"
            accessibilityRole="button"
            accessibilityState={{ expanded: isStatePickerOpen }}
            onPress={() => setIsStatePickerOpen((prev) => !prev)}
            style={[styles.selectorButton, isStatePickerOpen && styles.selectorButtonActive]}
          >
            <View style={styles.selectorTextGroup}>
              <Text variant="caption" color="textMuted">
                Estado selecionado
              </Text>
              <Text variant="label">{selectedStateLabel}</Text>
            </View>
            <Text variant="label" color="primary">
              {isStatePickerOpen ? 'Fechar ▲' : 'Trocar ▼'}
            </Text>
          </Pressable>

          {isStatePickerOpen ? (
            <View style={styles.dropdownPanel}>
              {STATE_OPTIONS.map((item) => {
                const isSelected = item.uf === selectedState;
                return (
                  <Pressable
                    key={item.uf}
                    testID={`state-option-${item.uf}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => handleSelectState(item.uf)}
                    style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                  >
                    <Text
                      variant={isSelected ? 'label' : 'body'}
                      color={isSelected ? 'primary' : 'text'}
                    >
                      {item.name} ({item.uf})
                    </Text>
                    {isSelected ? (
                      <Text variant="caption" color="primary">
                        Atual
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>

        {/* 2. Cidade — Campo clicável que só lista após digitar 3 letras */}
        <View style={styles.section}>
          <Text variant="subtitle">2. Cidade</Text>

          {selectedCityId && !isSearchingCity ? (
            <Pressable
              testID="city-selector-trigger"
              accessibilityRole="button"
              onPress={() => setIsSearchingCity(true)}
              style={styles.selectorButton}
            >
              <View style={styles.selectorTextGroup}>
                <Text variant="caption" color="textMuted">
                  Cidade selecionada
                </Text>
                <Text variant="label">
                  {selectedCityName}, {selectedState}
                </Text>
              </View>
              <Text variant="label" color="primary">
                Alterar
              </Text>
            </Pressable>
          ) : (
            <View style={styles.citySearchBox}>
              <TextField
                label={`Buscar cidade em ${selectedState}`}
                placeholder="Digite pelo menos 3 letras (ex.: Feira, São...)"
                value={cityQuery}
                onChangeText={setCityQuery}
                autoFocus
              />

              {!hasMinChars ? (
                <Text variant="caption" color="textMuted">
                  Digite pelo menos {MIN_CITY_QUERY_LENGTH} letras para ver as cidades de{' '}
                  {selectedState}.
                </Text>
              ) : citiesQuery.isLoading ? (
                <Text variant="caption" color="textMuted">
                  Buscando cidades...
                </Text>
              ) : matchingCities.length === 0 ? (
                <Text variant="caption" color="textMuted">
                  Nenhuma cidade encontrada com &ldquo;{cityQuery}&rdquo; em {selectedState}.
                </Text>
              ) : (
                <View style={styles.dropdownPanel}>
                  {matchingCities.map((city) => {
                    const isSelected = city.id === selectedCityId;
                    return (
                      <Pressable
                        key={city.id}
                        testID={`city-option-${city.id}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => handleSelectCity(city)}
                        style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                      >
                        <Text
                          variant={isSelected ? 'label' : 'body'}
                          color={isSelected ? 'primary' : 'text'}
                        >
                          {city.name}
                        </Text>
                        <Text variant="caption" color="primary">
                          Selecionar
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {selectedCityId ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setIsSearchingCity(false);
                    setCityQuery('');
                  }}
                >
                  <Text variant="caption" color="primary">
                    Manter {selectedCityName}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </View>

        {/* 3. Escalonamento por Bairro (apenas bairros já cadastrados naquela cidade) */}
        {selectedCityId ? (
          <View style={styles.section}>
            <Text variant="subtitle">3. Priorizar bairro em {selectedCityName} (opcional)</Text>
            <Text variant="caption" color="textMuted">
              Mostramos apenas os bairros que já possuem professores cadastrados nesta cidade. Os
              professores do seu bairro aparecerão no topo da lista, seguidos pelos demais da mesma
              cidade.
            </Text>

            {neighborhoodsQuery.isLoading ? (
              <Text color="textMuted">Buscando bairros com professores...</Text>
            ) : availableNeighborhoods.length === 0 ? (
              <Text variant="caption" color="textMuted">
                Ainda não há bairros específicos com professores publicados em {selectedCityName}. A
                busca trará todos os professores da cidade.
              </Text>
            ) : (
              <View style={styles.wrapChips}>
                <Pressable
                  testID="neighborhood-chip-all"
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: selectedNeighborhoods.length === 0,
                  }}
                  onPress={() => setSelectedNeighborhoods([])}
                  style={[styles.chip, selectedNeighborhoods.length === 0 && styles.chipSelected]}
                >
                  <Text
                    variant="caption"
                    color={selectedNeighborhoods.length === 0 ? 'primary' : 'text'}
                  >
                    Toda a cidade
                  </Text>
                </Pressable>

                {availableNeighborhoods.map((neighborhood) => {
                  const isSelected = selectedNeighborhoods.includes(neighborhood);
                  return (
                    <Pressable
                      key={neighborhood}
                      testID={`neighborhood-chip-${neighborhood}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => toggleNeighborhood(neighborhood)}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                    >
                      <Text variant="caption" color={isSelected ? 'primary' : 'text'}>
                        {neighborhood}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}

        <Button
          title={
            selectedCityName
              ? `Confirmar (${selectedCityName}, ${selectedState})`
              : 'Selecione uma cidade para continuar'
          }
          disabled={!selectedCityId || !selectedCityName}
          onPress={handleApplyLocation}
        />
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
  selectorButton: {
    minHeight: layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectorButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accentSoft,
  },
  selectorTextGroup: {
    flex: 1,
    gap: 2,
  },
  citySearchBox: {
    gap: spacing.sm,
  },
  dropdownPanel: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  dropdownItem: {
    minHeight: layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  dropdownItemSelected: {
    backgroundColor: colors.accentSoft,
  },
  wrapChips: {
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
});
