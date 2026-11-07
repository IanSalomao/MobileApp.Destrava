import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Text } from './text';

export type AvatarPickerProps = {
  /** URI local da imagem já escolhida (pré-visualização). */
  imageUri?: string | null;
  onPress: () => void;
  loading?: boolean;
  label?: string;
  hint?: string;
};

// Botão circular de foto de perfil (apresentacional). Quem escolhe/envia o arquivo é a tela/hook.
export function AvatarPicker({
  imageUri,
  onPress,
  loading = false,
  label = 'Adicionar foto',
  hint,
}: AvatarPickerProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        disabled={loading}
        style={styles.circle}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
        ) : (
          <Ionicons name="camera-outline" size={28} color={colors.primary} />
        )}
      </Pressable>
      <Text variant="label" color="primary">
        {label}
      </Text>
      {hint ? (
        <Text variant="caption" color="textMuted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const SIZE = 96;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
