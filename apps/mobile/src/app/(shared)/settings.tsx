import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { getAuthErrorMessage } from '@/features/auth/errors';
import { useSignOut } from '@/features/auth/hooks';
import { SettingsRow } from '@/features/settings/components/settings-row';
import { useCacheSize, useClearCache } from '@/features/settings/hooks';
import { CACHE_LIMIT_BYTES, formatBytes } from '@/lib/cache';
import { colors, radius, spacing } from '@/theme';

export default function SettingsScreen() {
  const cacheSize = useCacheSize();
  const clearCache = useClearCache();
  const signOut = useSignOut();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  const sizeLabel = cacheSize.isPending
    ? 'Calculando...'
    : cacheSize.isError
      ? 'Não foi possível calcular'
      : formatBytes(cacheSize.data ?? 0);
  const isOverLimit = (cacheSize.data ?? 0) > CACHE_LIMIT_BYTES;

  return (
    <Screen>
      <View style={styles.section}>
        <Text variant="subtitle">Armazenamento</Text>
        <View style={styles.card}>
          <View style={styles.cacheInfo}>
            <Text variant="label">Cache local</Text>
            <Text variant="body" color={isOverLimit ? 'warning' : 'textSecondary'}>
              {sizeLabel} de {formatBytes(CACHE_LIMIT_BYTES)}
            </Text>
            {isOverLimit ? (
              <Text variant="caption" color="warning">
                O cache passou do limite de 200 MB. Limpe para liberar espaço.
              </Text>
            ) : null}
            {cacheSize.errorMessage ? (
              <Text variant="caption" color="danger">
                {cacheSize.errorMessage}
              </Text>
            ) : null}
          </View>

          <Button
            title="Limpar cache"
            variant="secondary"
            loading={clearCache.isPending}
            disabled={clearCache.isPending}
            onPress={() => clearCache.mutate()}
          />

          {clearCache.isSuccess ? (
            <Text variant="caption" color="success">
              Cache limpo.
            </Text>
          ) : null}
          {clearCache.errorMessage ? (
            <Text variant="caption" color="danger">
              {clearCache.errorMessage}
            </Text>
          ) : null}

          <Text variant="caption" color="textMuted">
            Limpar o cache não encerra sua sessão.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="subtitle">Legal</Text>
        <SettingsRow title="Termos de Uso" onPress={() => router.push('/terms')} />
        <SettingsRow title="Política de Privacidade" onPress={() => router.push('/privacy')} />
      </View>

      <View style={styles.section}>
        <Text variant="subtitle">Conta</Text>
        <SettingsRow
          title="Sair da conta"
          danger
          showChevron={false}
          onPress={() => setConfirmingSignOut(true)}
        />

        {confirmingSignOut ? (
          <View style={styles.confirmCard}>
            <Text variant="label">Tem certeza que deseja sair?</Text>
            <View style={styles.confirmActions}>
              <Button
                title="Cancelar"
                variant="secondary"
                style={styles.confirmButton}
                disabled={signOut.isPending}
                onPress={() => setConfirmingSignOut(false)}
              />
              <Button
                title="Sair"
                style={styles.confirmButton}
                loading={signOut.isPending}
                onPress={() => signOut.mutate()}
              />
            </View>
            {signOut.error ? (
              <Text variant="caption" color="danger">
                {getAuthErrorMessage(signOut.error)}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cacheInfo: {
    gap: spacing.xxs,
  },
  confirmCard: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  confirmButton: {
    flex: 1,
  },
});
