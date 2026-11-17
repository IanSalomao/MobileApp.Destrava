import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors, layout } from '@/theme';

import { useFavoriteIds, useIsFavorite, useToggleFavorite } from '../hooks';

export type FavoriteButtonProps = {
  teacherId: string;
  style?: StyleProp<ViewStyle>;
};

// Coração de favorito. Só precisa do id do professor: o estado vem da lista de favoritos do
// responsável (uma consulta compartilhada), então serve igual no card da busca e no perfil.
export function FavoriteButton({ teacherId, style }: FavoriteButtonProps) {
  const ids = useFavoriteIds();
  const isFavorite = useIsFavorite(teacherId);
  const toggle = useToggleFavorite();

  return (
    <Pressable
      testID={`favorite-button-${teacherId}`}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      accessibilityState={{ selected: isFavorite, disabled: ids.isPending }}
      disabled={ids.isPending}
      hitSlop={8}
      onPress={() => toggle.mutate({ teacherId, isFavorite })}
      style={[styles.button, style]}
    >
      <Text variant="subtitle" style={isFavorite ? styles.filled : styles.empty}>
        {isFavorite ? '♥' : '♡'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    color: colors.danger,
  },
  empty: {
    color: colors.textMuted,
  },
});
