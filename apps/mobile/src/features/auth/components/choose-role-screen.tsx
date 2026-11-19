import Ionicons from '@expo/vector-icons/Ionicons';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useController } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormTextField } from '@/components/form/form-text-field';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Text } from '@/components/ui/text';
import type { UserRole } from '@/features/profile/types';
import { maskPhoneBR } from '@/lib/masks';
import { colors, radius, spacing } from '@/theme';

import type { useChooseRoleForm } from '../hooks';
import { TermsConsentFields } from './terms-consent-fields';
import { ROLE_OPTIONS } from './welcome-screen';

type ChooseRoleScreenProps = {
  vm: ReturnType<typeof useChooseRoleForm>;
  onSignOut: () => void;
};

// Escolha de papel de quem entrou pelo Google (RNF06). Mesmo visual da primeira tela (protótipo
// "ESCOLHA DE PERFIL"); depois de escolher, pede o celular (botão do WhatsApp, RF09) e o aceite dos
// Termos, que o Google não informa.
export function ChooseRoleScreen({ vm, onSignOut }: ChooseRoleScreenProps) {
  const {
    field: { value: role },
    fieldState: { error: roleError },
  } = useController({ control: vm.control, name: 'role' });

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
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text variant="small" color="primary" style={styles.eyebrow}>
                BEM-VINDO AO DESTRAVA
              </Text>
              <Text variant="title">Como você quer usar o app?</Text>
              <Text color="textMuted">
                Escolha seu perfil para personalizarmos sua experiência.
              </Text>
            </View>

            {ROLE_OPTIONS.map((option) => {
              const selected = role === option.role;
              return (
                <Pressable
                  key={option.role}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.title}
                  onPress={() => vm.setRole(option.role as UserRole)}
                  style={({ pressed }) => [
                    styles.card,
                    (pressed || selected) && styles.cardSelected,
                  ]}
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
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={selected ? colors.primary : colors.textMuted}
                  />
                </Pressable>
              );
            })}
            {roleError?.message ? (
              <Text accessibilityRole="alert" variant="caption" color="danger">
                {roleError.message}
              </Text>
            ) : null}

            {role ? (
              <>
                <FormTextField
                  control={vm.control}
                  name="phone"
                  label="Celular"
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                  maskFormatter={maskPhoneBR}
                  helperText="Só aparece para a outra parte depois de um contato aceito."
                  leftIcon={<Ionicons name="call-outline" size={20} color={colors.textMuted} />}
                />
                <TermsConsentFields control={vm.control} />
                {vm.errorMessage ? <Text color="danger">{vm.errorMessage}</Text> : null}
                <Button title="Continuar" loading={vm.isSubmitting} onPress={vm.submit} />
              </>
            ) : null}

            <View style={styles.spacer} />

            <View style={styles.footer}>
              <Text color="textMuted">Entrou com a conta errada? </Text>
              <Text variant="label" color="primary" onPress={onSignOut}>
                Sair
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  flex: {
    flex: 1,
  },
  hero: {
    height: 220,
    paddingHorizontal: spacing.lg,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xxl,
  },
  circle: {
    position: 'absolute',
    borderRadius: radius.full,
    backgroundColor: colors.overlayLight,
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
    backgroundColor: colors.overlayLight,
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
  cardSelected: {
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
