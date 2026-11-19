import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { formatHourlyRate } from '@/components/ui/teacher-card';
import { Text } from '@/components/ui/text';
import { formatAverage, formatReviewCount } from '@/features/reviews/domain';
import { colors, radius, spacing } from '@/theme';

import { SOCIAL_NETWORK_LABELS, VERIFICATION_STATUS_LABELS } from '../domain';
import { formatLocation, formatSocialLink, formatTutoringTypes } from '../public-profile/domain';
import type { MyTeacherProfile } from '../types';

type TeacherAccountViewProps = {
  profile: MyTeacherProfile;
  onEditProfile: () => void;
  onSeeReviews: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
};

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  danger?: boolean;
};

function Stat({
  value,
  label,
  divided = false,
}: {
  value: string;
  label: string;
  divided?: boolean;
}) {
  return (
    <View style={[styles.stat, divided && styles.statDivider]}>
      <Text variant="subtitle">{value}</Text>
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
    </View>
  );
}

// "Meu perfil" do professor (RF01, RF06): prévia do que as famílias veem, situação na busca e o
// menu da conta. Só desenha o que recebe; a rota decide a navegação.
export function TeacherAccountView({
  profile,
  onEditProfile,
  onSeeReviews,
  onOpenSettings,
  onSignOut,
}: TeacherAccountViewProps) {
  const location = formatLocation(null, profile.cityName, profile.state);
  const tutoringTypes = formatTutoringTypes(profile.tutoringTypes);
  const socialLink = profile.socialLinks[0];
  const isVerified = profile.verificationStatus === 'approved';

  const menu: MenuItem[] = [
    { label: 'Editar perfil', icon: 'create-outline', onPress: onEditProfile },
    { label: 'Avaliações recebidas', icon: 'star-outline', onPress: onSeeReviews },
    { label: 'Configurações', icon: 'settings-outline', onPress: onOpenSettings },
    { label: 'Sair da conta', icon: 'log-out-outline', onPress: onSignOut, danger: true },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar name={profile.fullName} imageUrl={profile.avatarUrl} size="lg" />
        <View style={styles.headerInfo}>
          <Text variant="heading" numberOfLines={2}>
            {profile.fullName || 'Professor'}
          </Text>
          <View style={[styles.badge, isVerified ? styles.badgeOk : styles.badgeWarning]}>
            <Ionicons
              name={isVerified ? 'checkmark-circle' : 'alert-circle'}
              size={14}
              color={isVerified ? colors.primary : colors.warning}
            />
            <Text variant="small" color={isVerified ? 'primary' : 'warning'}>
              {VERIFICATION_STATUS_LABELS[profile.verificationStatus]}
            </Text>
          </View>
          {location ? (
            <Text variant="caption" color="textSecondary">
              {location}
            </Text>
          ) : null}
        </View>
      </View>

      <View
        style={[styles.status, profile.isPublished ? styles.statusOk : styles.statusWarning]}
        testID="teacher-account-status"
      >
        <Ionicons
          name={profile.isPublished ? 'eye-outline' : 'eye-off-outline'}
          size={20}
          color={profile.isPublished ? colors.primary : colors.warning}
        />
        <Text variant="caption" color="textSecondary" style={styles.statusText}>
          {profile.isPublished
            ? 'Seu perfil aparece nas buscas das famílias.'
            : 'Seu perfil está fora das buscas. Conclua o cadastro e a assinatura no início.'}
        </Text>
      </View>

      <View style={styles.statsCard}>
        <Stat value={formatAverage(profile.ratingAverage)} label="Nota" />
        <Stat value={String(profile.ratingCount)} label="Avaliações" divided />
        <Stat
          value={profile.hourlyRateCents ? formatHourlyRate(profile.hourlyRateCents) : '—'}
          label="Valor"
          divided
        />
      </View>

      <View style={styles.section}>
        <Text variant="subtitle">Como as famílias veem</Text>
        <Text variant="body" color={profile.bio ? 'textSecondary' : 'textMuted'}>
          {profile.bio ?? 'Você ainda não escreveu sobre suas aulas.'}
        </Text>
        {profile.subjects.length > 0 || profile.languages.length > 0 ? (
          <View style={styles.chips}>
            {[...profile.subjects, ...profile.languages].map((item) => (
              <View key={item.id} style={styles.chip}>
                <Text variant="caption" color="primary">
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        {tutoringTypes.length > 0 ? (
          <Text variant="caption" color="textMuted">
            Aulas: {tutoringTypes.join(' e ').toLowerCase()} ·{' '}
            {formatReviewCount(profile.ratingCount)}
          </Text>
        ) : null}
        <Text variant="caption" color="textMuted">
          {socialLink
            ? `${SOCIAL_NETWORK_LABELS[socialLink.network]}: ${formatSocialLink(socialLink.url)} (liberado após o aceite)`
            : 'Sem rede social cadastrada.'}
        </Text>
      </View>

      <View style={styles.menu}>
        {menu.map((item, index) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.menuRow,
              index > 0 && styles.menuRowDivider,
              pressed && styles.menuRowPressed,
            ]}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={item.danger ? colors.danger : colors.primary}
            />
            <Text
              variant="bodyMedium"
              color={item.danger ? 'danger' : 'text'}
              style={styles.menuLabel}
            >
              {item.label}
            </Text>
            {item.danger ? null : (
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            )}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerInfo: {
    flex: 1,
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  badgeOk: {
    backgroundColor: colors.primarySoft,
  },
  badgeWarning: {
    backgroundColor: colors.warningSoft,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  statusOk: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  statusWarning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warningBorder,
  },
  statusText: {
    flex: 1,
  },
  statsCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  section: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  menu: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuRowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuRowPressed: {
    backgroundColor: colors.backgroundSubtle,
  },
  menuLabel: {
    flex: 1,
  },
});
