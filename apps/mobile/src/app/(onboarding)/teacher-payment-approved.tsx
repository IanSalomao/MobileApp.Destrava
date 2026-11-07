import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { colors, radius, spacing } from '@/theme';

// No MVP o pagamento é sempre aprovado (cobrança simulada, RF13).
export default function TeacherPaymentApprovedScreen() {
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.spacer} />

      <View style={styles.center}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={40} color={colors.onPrimary} />
        </View>
        <Text variant="small" color="primary" style={styles.eyebrow}>
          PAGAMENTO APROVADO
        </Text>
        <Text variant="title" style={styles.centerText}>
          Agora falta pouco!
        </Text>
        <Text color="textMuted" style={styles.centerText}>
          Sua assinatura está ativa. Complete seu cadastro profissional para começar a receber
          solicitações.
        </Text>
      </View>

      <View style={styles.planRow}>
        <View style={styles.planIcon}>
          <Ionicons name="card-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.planTexts}>
          <Text variant="label">Professor Destrava</Text>
          <Text variant="caption" color="textMuted">
            7 dias grátis • Ativo
          </Text>
        </View>
        <View style={styles.approvedBadge}>
          <Text variant="small" color="primary">
            APROVADO
          </Text>
        </View>
      </View>

      <View style={styles.spacer} />

      <Button
        title="Completar meu perfil"
        onPress={() => router.replace('/teacher-professional')}
        leftIcon={<Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />}
      />
      <Button title="Fazer isso depois" variant="ghost" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  spacer: {
    flex: 1,
    minHeight: spacing.lg,
  },
  center: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  eyebrow: {
    letterSpacing: 1,
  },
  centerText: {
    textAlign: 'center',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSubtle,
    marginTop: spacing.lg,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTexts: {
    flex: 1,
    gap: spacing.xxs,
  },
  approvedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySoft,
  },
});
