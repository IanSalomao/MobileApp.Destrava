import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { colors, layout, radius, spacing } from '@/theme';

export type AccountHeaderProps = {
  fullName: string;
  subtitle: string;
  avatarUrl: string | null;
  isUploading: boolean;
  onChangePhoto: () => void;
};

// Topo do Meu perfil: foto (ou iniciais), nome, "Responsável por ..." e o botão de câmera que
// troca a foto. Protótipo: PERFIL RESPONSAVEL.
export function AccountHeader({
  fullName,
  subtitle,
  avatarUrl,
  isUploading,
  onChangePhoto,
}: AccountHeaderProps) {
  const displayName = fullName.trim() || 'Sem nome';

  return (
    <View style={styles.row}>
      <Avatar name={displayName} imageUrl={avatarUrl} size="lg" />
      <View style={styles.info}>
        <Text variant="subtitle" numberOfLines={2}>
          {displayName}
        </Text>
        <Text variant="caption" color="textMuted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Pressable
        testID="change-photo-button"
        accessibilityRole="button"
        accessibilityLabel="Trocar foto de perfil"
        accessibilityHint="Abre a galeria para escolher uma foto"
        accessibilityState={{ disabled: isUploading, busy: isUploading }}
        disabled={isUploading}
        onPress={onChangePhoto}
        style={({ pressed }) => [styles.cameraButton, pressed && styles.pressed]}
      >
        {isUploading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Ionicons name="camera-outline" size={22} color={colors.text} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
  },
  cameraButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
