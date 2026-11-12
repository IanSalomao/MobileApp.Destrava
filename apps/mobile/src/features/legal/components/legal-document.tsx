import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { TERMS_VERSION } from '@/features/auth/consent';
import { spacing } from '@/theme';

import { LEGAL_VERSION_DATE } from '../content';
import type { LegalSection } from '../types';

type LegalDocumentProps = {
  title: string;
  intro: string;
  controller?: string;
  sections: LegalSection[];
};

export function LegalDocument({ title, intro, controller, sections }: LegalDocumentProps) {
  return (
    <>
      <Text variant="subtitle">{title}</Text>
      <Text variant="caption" color="textMuted">
        Versão {TERMS_VERSION} · vigente desde {LEGAL_VERSION_DATE}
      </Text>

      <Text variant="body" color="textSecondary">
        {intro}
      </Text>

      {controller ? (
        <Text variant="body" color="textSecondary">
          {controller}
        </Text>
      ) : null}

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text variant="subtitle">{section.title}</Text>
          {section.paragraphs?.map((paragraph) => (
            <Text key={paragraph} variant="body" color="textSecondary">
              {paragraph}
            </Text>
          ))}
          {section.bullets?.map((bullet) => (
            <View key={bullet} style={styles.bulletRow}>
              <Text variant="body" color="textSecondary">
                •
              </Text>
              <Text variant="body" color="textSecondary" style={styles.bulletText}>
                {bullet}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletText: {
    flex: 1,
  },
});
