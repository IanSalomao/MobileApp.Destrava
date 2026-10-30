import { useState } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

import { Text } from './text';

export type AvatarSize = 'sm' | 'md' | 'lg';

export type AvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const AVATAR_DIMENSIONS: Record<AvatarSize, number> = {
  sm: 36,
  md: 48,
  lg: 64,
};

export function getInitials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((part) => !/^(prof|profa|dr|dra)\.?$/i.test(part));

  const targetParts = parts.length > 0 ? parts : fullName.trim().split(/\s+/);
  if (targetParts.length === 0 || !targetParts[0]) return '?';
  if (targetParts.length === 1) return targetParts[0].slice(0, 2).toUpperCase();

  const first = targetParts[0][0] ?? '';
  const last = targetParts[targetParts.length - 1][0] ?? '';
  return `${first}${last}`.toUpperCase();
}

export function Avatar({ name, imageUrl, size = 'md', style, testID }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const dimension = AVATAR_DIMENSIONS[size];
  const showImage = Boolean(imageUrl && !imageError);
  const initials = getInitials(name);

  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={`Foto de ${name}`}
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: radius.full,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          testID="avatar-image"
          source={{ uri: imageUrl! }}
          style={{
            width: dimension,
            height: dimension,
            borderRadius: radius.full,
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        <Text
          variant={size === 'lg' ? 'subtitle' : 'label'}
          color="primary"
          testID="avatar-initials"
        >
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
