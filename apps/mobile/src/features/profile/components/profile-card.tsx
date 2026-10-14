import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors, radius, spacing } from '@/theme';

import { useMyProfile } from '../hooks';
import { ROLE_LABELS } from '../types';

export function ProfileCard({ email }: { email?: string }) {
  const { data: profile, isPending, isError } = useMyProfile();

  if (isPending) {
    return <ActivityIndicator color={colors.primary} />;
  }

  if (isError) {
    return <Text color="danger">Não foi possível carregar seu perfil.</Text>;
  }

  return (
    <View style={styles.card}>
      <Text variant="subtitle">{profile.full_name || 'Sem nome'}</Text>
      {email ? <Text color="textMuted">{email}</Text> : null}
      {profile.role ? (
        <View style={styles.badge}>
          <Text variant="caption" color="primary">
            {ROLE_LABELS[profile.role]}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
  },
});
