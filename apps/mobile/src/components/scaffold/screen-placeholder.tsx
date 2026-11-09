import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { colors, spacing } from '@/theme';

// PROVISÓRIO: corpo das rotas que ainda não foram desenvolvidas. Mostra no centro quem é o
// responsável pela tela (a divisão está no README, em "Divisão das telas do MVP") e, embaixo,
// atalhos para as telas seguintes do fluxo, para a navegação funcionar de ponta a ponta desde já.
// Quem assumir a tela troca o conteúdo da rota inteiro. Quando nenhuma rota usar mais este
// componente, apague a pasta components/scaffold.

export type TeamMember =
  'Anna Beatriz Lima' | 'Fátima Pinho' | 'Ian Salomão' | 'Rebeca Batista' | 'Valeria Soares';

export type PlaceholderLink = {
  label: string;
  /** Rota aberta com router.push. */
  href?: Href;
  /** Ação própria, quando não é um push simples (voltar, trocar de aba, sair da conta). */
  onPress?: () => void;
};

type ScreenPlaceholderProps = {
  owner: TeamMember;
  links?: PlaceholderLink[];
  /** Bordas que respeitam a área segura. Telas sem header nativo precisam de 'top' também. */
  edges?: Edge[];
};

function open(link: PlaceholderLink) {
  if (link.onPress) link.onPress();
  else if (link.href) router.push(link.href);
}

export function ScreenPlaceholder({
  owner,
  links = [],
  edges = ['bottom'],
}: ScreenPlaceholderProps) {
  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      <View style={styles.center}>
        <Text variant="caption" color="textMuted">
          Responsável pela tela
        </Text>
        <Text variant="subtitle" style={styles.owner}>
          {owner}
        </Text>
      </View>
      {links.length > 0 ? (
        <View style={styles.links}>
          {links.map((link) => (
            <Button
              key={link.label}
              title={link.label}
              variant="secondary"
              onPress={() => open(link)}
            />
          ))}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  owner: {
    textAlign: 'center',
  },
  links: {
    gap: spacing.sm,
  },
});
