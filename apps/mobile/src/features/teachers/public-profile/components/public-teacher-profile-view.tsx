import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/ui/rating';
import { formatHourlyRate } from '@/components/ui/teacher-card';
import { Text } from '@/components/ui/text';
import { colors, radius, spacing } from '@/theme';

import { SOCIAL_NETWORK_LABELS } from '../../domain';
import {
  formatEducationLevels,
  formatSocialLink,
  formatLocation,
  formatPeriods,
  formatRatingSummary,
  formatTutoringTypes,
  formatWeekdays,
} from '../domain';
import type { PublicTeacherProfile, TeacherContact } from '../types';

type PublicTeacherProfileViewProps = {
  profile: PublicTeacherProfile;
  onRequestContact: () => void;
  onSeeReviews: () => void;
  /** Situação do contato com o professor. Ausente = ainda sem solicitação. */
  contact?: TeacherContact;
  onSeeRequest?: (requestId: string) => void;
  onOpenWhatsApp?: () => void;
  onOpenSocialLink?: (url: string) => void;
  onWriteReview?: () => void;
  /** Erro ao abrir o WhatsApp ou a rede social. */
  contactError?: string | null;
  /** Ação ao lado do nome, como o coração de favorito. A tela decide o que colocar. */
  headerAction?: ReactNode;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="subtitle">{title}</Text>
      {children}
    </View>
  );
}

function ChipList({ items, testID }: { items: string[]; testID?: string }) {
  return (
    <View testID={testID} style={styles.chips}>
      {items.map((item) => (
        <View key={item} style={styles.chip}>
          <Text variant="caption" color="primary">
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

// Apresentação do perfil público (só desenha o que recebe, sem buscar dados). Os botões de
// navegação chegam por props para a tela decidir para onde ir.
export function PublicTeacherProfileView({
  profile,
  onRequestContact,
  onSeeReviews,
  contact = { status: 'none' },
  onSeeRequest,
  onOpenWhatsApp,
  onOpenSocialLink,
  onWriteReview,
  contactError,
  headerAction,
}: PublicTeacherProfileViewProps) {
  const location = formatLocation(profile.neighborhood, profile.cityName, profile.state);
  const tutoringTypes = formatTutoringTypes(profile.tutoringTypes);
  const educationLevels = formatEducationLevels(profile.educationLevels);
  const weekdays = formatWeekdays(profile.weekdays);
  const periods = formatPeriods(profile.periods);
  const hasReviews = profile.ratingCount > 0 && profile.ratingAverage !== null;

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar name={profile.fullName} imageUrl={profile.avatarUrl} size="lg" />
          <View style={styles.headerInfo}>
            <Text variant="heading" numberOfLines={2}>
              {profile.fullName}
            </Text>
            <View style={styles.verifiedBadge} testID="public-profile-verified-badge">
              <Text variant="caption" color="primary">
                Verificado
              </Text>
            </View>
            {location ? (
              <Text variant="caption" color="textMuted">
                {location}
              </Text>
            ) : null}
          </View>
          {headerAction}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            {hasReviews ? (
              <Rating value={profile.ratingAverage ?? 0} readOnly />
            ) : (
              <Text variant="label" color="textMuted">
                Novo
              </Text>
            )}
            <Text variant="caption" color="textMuted">
              {formatRatingSummary(profile.ratingCount)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text variant="label" color="primary">
              {profile.hourlyRateCents !== null
                ? formatHourlyRate(profile.hourlyRateCents)
                : 'Valor a combinar'}
            </Text>
            <Text variant="caption" color="textMuted">
              Valor da hora-aula
            </Text>
          </View>
        </View>

        {profile.bio ? (
          <Section title="Sobre">
            <Text variant="body" color="textSecondary">
              {profile.bio}
            </Text>
          </Section>
        ) : null}

        {profile.subjects.length > 0 ? (
          <Section title="Matérias">
            <ChipList
              testID="public-profile-subjects"
              items={profile.subjects.map((s) => s.name)}
            />
          </Section>
        ) : null}

        {profile.languages.length > 0 ? (
          <Section title="Idiomas">
            <ChipList items={profile.languages.map((l) => l.name)} />
          </Section>
        ) : null}

        {tutoringTypes.length > 0 || educationLevels.length > 0 ? (
          <Section title="Como são as aulas">
            {tutoringTypes.length > 0 ? <ChipList items={tutoringTypes} /> : null}
            {educationLevels.length > 0 ? (
              <Text variant="caption" color="textMuted">
                Atende: {educationLevels.join(', ')}
              </Text>
            ) : null}
          </Section>
        ) : null}

        {weekdays.length > 0 || periods.length > 0 ? (
          <Section title="Disponibilidade">
            {weekdays.length > 0 ? <ChipList items={weekdays} /> : null}
            {periods.length > 0 ? (
              <Text variant="caption" color="textMuted">
                Períodos: {periods.join(', ')}
              </Text>
            ) : null}
          </Section>
        ) : null}

        <Section title="Avaliações">
          <Text variant="body" color="textSecondary">
            {hasReviews
              ? `Nota ${(profile.ratingAverage ?? 0).toFixed(1)} em ${formatRatingSummary(profile.ratingCount)}.`
              : 'Este professor ainda não recebeu avaliações.'}
          </Text>
          {hasReviews ? (
            <Button title="Ver todas as avaliações" variant="secondary" onPress={onSeeReviews} />
          ) : null}
        </Section>

        {contact.status === 'accepted' ? (
          <Section title="Contato liberado">
            {contact.socialLinks.map((link) => (
              <Pressable
                key={link.network}
                accessibilityRole="link"
                accessibilityLabel={`Abrir ${SOCIAL_NETWORK_LABELS[link.network]}`}
                onPress={() => onOpenSocialLink?.(link.url)}
                style={({ pressed }) => [styles.contactRow, pressed && styles.contactRowPressed]}
              >
                <View style={styles.contactIcon}>
                  <Ionicons name="link-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.contactTexts}>
                  <Text variant="label" numberOfLines={1}>
                    {formatSocialLink(link.url)}
                  </Text>
                  <Text variant="caption" color="textMuted">
                    {SOCIAL_NETWORK_LABELS[link.network]}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Pressable>
            ))}
            {contact.socialLinks.length === 0 ? (
              <Text variant="body" color="textSecondary">
                O professor ainda não cadastrou uma rede social.
              </Text>
            ) : null}
            {contact.phone ? null : (
              <Text variant="caption" color="textMuted">
                O professor ainda não cadastrou o WhatsApp.
              </Text>
            )}
            {onWriteReview ? (
              <Button title="Avaliar professor" variant="secondary" onPress={onWriteReview} />
            ) : null}
          </Section>
        ) : (
          <Banner description="O WhatsApp e a rede social do professor só aparecem depois que ele aceitar a sua solicitação de contato." />
        )}
      </ScrollView>

      <View style={styles.footer}>
        {contactError ? (
          <Text accessibilityRole="alert" variant="caption" color="danger">
            {contactError}
          </Text>
        ) : null}
        {contact.status === 'accepted' ? (
          <Button
            title="Conversar no WhatsApp"
            disabled={!contact.phone}
            onPress={() => onOpenWhatsApp?.()}
            leftIcon={<Ionicons name="logo-whatsapp" size={18} color={colors.onPrimary} />}
          />
        ) : contact.status === 'pending' ? (
          <Button
            title="Solicitação enviada: ver pedido"
            variant="secondary"
            onPress={() => onSeeRequest?.(contact.requestId)}
          />
        ) : (
          <Button title="Solicitar contato" onPress={onRequestContact} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
  verifiedBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  summaryDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
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
    backgroundColor: colors.accentSoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  contactRowPressed: {
    backgroundColor: colors.primarySoft,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTexts: {
    flex: 1,
    gap: spacing.xxs,
  },
  footer: {
    gap: spacing.xs,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
