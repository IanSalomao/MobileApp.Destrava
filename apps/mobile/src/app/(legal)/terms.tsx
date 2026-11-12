import { Screen } from '@/components/ui/screen';
import { LegalDocument } from '@/features/legal/components/legal-document';
import { TERMS_INTRO, TERMS_SECTIONS, TERMS_TITLE } from '@/features/legal/content';

export default function TermsScreen() {
  return (
    <Screen>
      <LegalDocument title={TERMS_TITLE} intro={TERMS_INTRO} sections={TERMS_SECTIONS} />
    </Screen>
  );
}
