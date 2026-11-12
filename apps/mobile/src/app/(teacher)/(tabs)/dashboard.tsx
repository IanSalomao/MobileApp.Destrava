import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { SCHOOL_GRADE_LABELS } from '@/features/catalog/types';
import { DashboardContactRow } from '@/features/contact-requests/components/dashboard-contact-row';
import { useTeacherDashboard } from '@/features/contact-requests/hooks';
import { useMyProfile } from '@/features/profile/hooks';
import { formatRelativeTime } from '@/lib/relative-time';
import { colors, layout, radius, spacing } from '@/theme';

function formatRating(value: number | null): string {
  return value === null ? '—' : value.toFixed(1).replace('.', ',');
}

function openRequest(id: string) {
  router.push({ pathname: '/received-requests/[id]', params: { id } });
}

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
      <Text variant="heading">{value}</Text>
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
    </View>
  );
}

export default function TeacherDashboardScreen() {
  const profile = useMyProfile();
  const dashboard = useTeacherDashboard();

  const data = dashboard.data;
  const firstName = profile.data?.full_name?.trim().split(/\s+/)[0];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.greetingBlock}>
              <Text variant="body" color="onPrimary" style={styles.greeting}>
                Olá{firstName ? `, ${firstName}` : ''}
              </Text>
              <Text variant="title" color="onPrimary">
                Vamos ensinar?
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notificações"
              onPress={() => router.push('/notifications')}
              style={({ pressed }) => [styles.bell, pressed && styles.bellPressed]}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.onPrimary} />
            </Pressable>
          </View>

          {data ? (
            <View
              style={[
                styles.statusCard,
                data.isPublished ? styles.statusCardActive : styles.statusCardWarning,
              ]}
            >
              <Ionicons
                name={data.isPublished ? 'checkmark-circle' : 'alert-circle'}
                size={32}
                color={data.isPublished ? colors.onPrimary : colors.warning}
              />
              <View style={styles.statusInfo}>
                <Text variant="label" color={data.isPublished ? 'onPrimary' : 'text'}>
                  {data.isPublished ? 'Seu perfil está ativo' : 'Seu perfil não está visível'}
                </Text>
                <Text
                  variant="caption"
                  color={data.isPublished ? 'onPrimary' : 'textSecondary'}
                  style={data.isPublished ? styles.statusDescriptionActive : undefined}
                >
                  {data.isPublished
                    ? 'Visível para famílias na sua região'
                    : 'Conclua a verificação e a assinatura para aparecer nas buscas'}
                </Text>
              </View>
              <Button
                title={data.isPublished ? 'Ver perfil' : 'Ver assinatura'}
                variant={data.isPublished ? 'secondary' : 'primary'}
                onPress={() => router.push(data.isPublished ? '/teacher-account' : '/subscription')}
                style={styles.statusButton}
              />
            </View>
          ) : null}
        </View>
      </SafeAreaView>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent}>
        {dashboard.isPending ? (
          <View style={styles.state}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text color="textMuted">Carregando...</Text>
          </View>
        ) : null}

        {dashboard.isError ? (
          <View style={styles.state}>
            <Text variant="subtitle" color="danger">
              Não foi possível carregar seu painel
            </Text>
            <Button
              title="Tentar novamente"
              variant="secondary"
              onPress={() => dashboard.refetch()}
            />
          </View>
        ) : null}

        {data ? (
          <>
            <View style={styles.statsCard}>
              <Stat value={String(data.clientsCount)} label="Clientes" />
              <Stat value={String(data.conversationsCount)} label="Conversas" divided />
              <Stat value={formatRating(data.ratingAverage)} label="Avaliação" divided />
            </View>

            <View style={styles.section}>
              <Text variant="subtitle">Últimos contatos</Text>
              {data.recentContacts.length > 0 ? (
                data.recentContacts.map((contact) => (
                  <DashboardContactRow
                    key={contact.id}
                    testID={`recent-contact-${contact.id}`}
                    name={contact.guardianName}
                    avatarUrl={contact.guardianAvatarUrl}
                    subtitle="Conversa iniciada"
                    timeLabel={formatRelativeTime(contact.respondedAt ?? contact.createdAt)}
                    onPress={() => openRequest(contact.id)}
                  />
                ))
              ) : (
                <Text variant="caption" color="textMuted">
                  Nenhum contato aceito ainda.
                </Text>
              )}
            </View>

            <View style={styles.section}>
              <Text variant="subtitle">Últimas solicitações</Text>
              {data.recentRequests.length > 0 ? (
                data.recentRequests.map((request) => (
                  <DashboardContactRow
                    key={request.id}
                    testID={`recent-request-${request.id}`}
                    name={request.studentName}
                    subtitle={SCHOOL_GRADE_LABELS[request.schoolGrade]}
                    timeLabel={formatRelativeTime(request.createdAt)}
                    onPress={() => openRequest(request.id)}
                  />
                ))
              ) : (
                <Text variant="caption" color="textMuted">
                  Nenhuma solicitação pendente.
                </Text>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerSafe: {
    backgroundColor: colors.primary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  greetingBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
  greeting: {
    opacity: 0.85,
  },
  bell: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: radius.full,
    backgroundColor: colors.primaryPressed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellPressed: {
    opacity: 0.8,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  statusCardActive: {
    backgroundColor: colors.primaryPressed,
    borderColor: colors.primaryPressed,
  },
  statusCardWarning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warningBorder,
  },
  statusInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  statusDescriptionActive: {
    opacity: 0.85,
  },
  statusButton: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  sheetContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  statsCard: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
  state: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
});
