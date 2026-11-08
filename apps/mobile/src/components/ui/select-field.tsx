import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { colors, layout, radius, spacing } from '@/theme';

import { Text } from './text';
import { TextField } from './text-field';

export type SelectOption<T extends string | number> = {
  value: T;
  label: string;
};

export type SelectFieldProps<T extends string | number> = {
  label?: string;
  value: T | null | undefined;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  error?: string;
  /** Título do modal de opções. */
  modalTitle?: string;
  /** Mostra um campo de busca no modal (listas longas, como as cidades de um estado). */
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
};

// Busca sem diferenciar acento e maiúscula ("sao" encontra "São Paulo").
function normalizeForSearch(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Campo de seleção com um modal de opções próprio, para não depender de um picker nativo (RNF08).
export function SelectField<T extends string | number>({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  error,
  modalTitle,
  searchable = false,
  searchPlaceholder = 'Buscar',
  disabled = false,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value);

  const normalizedQuery = normalizeForSearch(query.trim());
  const visibleOptions =
    searchable && normalizedQuery
      ? options.filter((option) => normalizeForSearch(option.label).includes(normalizedQuery))
      : options;

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={styles.container}>
      {label ? <Text variant="label">{label}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          error ? styles.fieldError : null,
          disabled ? styles.fieldDisabled : null,
        ]}
      >
        <Text color={selected ? 'text' : 'textMuted'} style={styles.value} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? colors.disabledText : colors.textMuted}
        />
      </Pressable>

      {error ? (
        <Text accessibilityRole="alert" variant="caption" color="danger">
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoider}
        >
          <Pressable style={styles.backdrop} onPress={close}>
            <Pressable
              style={[styles.sheet, searchable ? styles.sheetSearchable : null]}
              onPress={(event) => event.stopPropagation()}
            >
              {modalTitle ? (
                <Text variant="subtitle" style={styles.sheetTitle}>
                  {modalTitle}
                </Text>
              ) : null}
              {searchable ? (
                <TextField
                  value={query}
                  onChangeText={setQuery}
                  placeholder={searchPlaceholder}
                  accessibilityLabel={searchPlaceholder}
                  autoCorrect={false}
                  autoCapitalize="none"
                  leftIcon={<Ionicons name="search" size={20} color={colors.textMuted} />}
                />
              ) : null}
              <FlatList
                data={visibleOptions}
                keyExtractor={(option) => String(option.value)}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <Text color="textMuted" style={styles.empty}>
                    Nenhuma opção encontrada.
                  </Text>
                }
                renderItem={({ item: option }) => {
                  const isSelected = option.value === value;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => {
                        onChange(option.value);
                        close();
                      }}
                      style={({ pressed }) => [
                        styles.option,
                        pressed && styles.optionPressed,
                        isSelected && styles.optionSelected,
                      ]}
                    >
                      <Text color={isSelected ? 'primary' : 'text'}>{option.label}</Text>
                      {isSelected ? (
                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                      ) : null}
                    </Pressable>
                  );
                }}
              />
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  field: {
    minHeight: Math.max(layout?.minTouchTarget ?? 44, 48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  fieldDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  value: {
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  // Altura fixa com busca, para o modal não encolher e crescer a cada letra digitada.
  sheetSearchable: {
    height: '70%',
    gap: spacing.sm,
  },
  sheetTitle: {
    marginBottom: spacing.sm,
  },
  empty: {
    paddingVertical: spacing.md,
    textAlign: 'center',
  },
  option: {
    minHeight: layout?.minTouchTarget ?? 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  optionPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  optionSelected: {
    backgroundColor: colors.accentSoft,
  },
});
