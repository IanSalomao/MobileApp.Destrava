import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/logo';
import { Text } from '@/components/ui/text';
import type { UserRole } from '@/features/profile/types';
import { colors, radius, spacing } from '@/theme';

// AUT-01: primeira decisão de quem vai criar conta. A escolha segue para o cadastro já com o perfil
// definido (/sign-up?role=guardian|teacher); quem já tem conta vai para o login.
const ROLE_OPTIONS: {
  role: UserRole;
  title: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    role: 'guardian',
    title: 'Sou pai ou responsável',
    hint: 'Quero encontrar reforço escolar',
    icon: 'people-outline',
  },
  {
    role: 'teacher',
    title: 'Sou professor',
    hint: 'Quero oferecer minhas aulas',
    icon: 'book-outline',
  },
];

export function WelcomeScreen() {
  const goToSignUp = (role: UserRole) => router.push({ pathname: '/sign-up', params: { role } });

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']}>
        <View style={styles.hero}>
          <View style={[styles.circle, styles.circleOne]} />
          <View style={[styles.circle, styles.circleTwo]} />
          <View style={styles.heroShape}>
            <Ionicons name="book-outline" size={28} color={colors.onPrimary} />
          </View>
          <Logo variant="onDark" width={150} />
        </View>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text variant="small" color="primary" style={styles.eyebrow}>
              BEM-VINDO AO DESTRAVA
            </Text>
            <Text variant="title">Como você quer usar o app?</Text>
            <Text color="textMuted">Escolha seu perfil para personalizarmos sua experiência.</Text>
          </View>

          {ROLE_OPTIONS.map((option) => (
            <Pressable
              key={option.role}
              accessibilityRole="button"
              accessibilityLabel={option.title}
              onPress={() => goToSignUp(option.role)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.cardIcon}>
                <Ionicons name={option.icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.cardTexts}>
                <Text variant="label">{option.title}</Text>
                <Text variant="caption" color="textMuted">
                  {option.hint}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          ))}

          <View style={styles.spacer} />

          <View style={styles.footer}>
            <Text color="textMuted">Já tem uma conta? </Text>
            <Text variant="label" color="primary" onPress={() => router.replace('/sign-in')}>
              Entrar
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  hero: {
    height: 220,
    paddingHorizontal: spacing.lg,
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
  circle: {
    position: 'absolute',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  circleOne: {
    width: 28,
    height: 28,
    top: 24,
    left: spacing.xl,
  },
  circleTwo: {
    width: 14,
    height: 14,
    top: 70,
    left: 90,
  },
  heroShape: {
    position: 'absolute',
    top: 24,
    right: spacing.lg,
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -spacing.lg,
  },
  sheetContent: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    letterSpacing: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  cardPressed: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTexts: {
    flex: 1,
    gap: spacing.xxs,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
