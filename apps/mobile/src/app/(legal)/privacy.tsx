import { Screen } from '@/components/ui/screen';
import { LegalDocument } from '@/features/legal/components/legal-document';
import {
  PRIVACY_CONTROLLER,
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
  PRIVACY_TITLE,
} from '@/features/legal/content';

export default function PrivacyScreen() {
  return (
    <Screen>
      <LegalDocument
        title={PRIVACY_TITLE}
        intro={PRIVACY_INTRO}
        controller={PRIVACY_CONTROLLER}
        sections={PRIVACY_SECTIONS}
      />
    </Screen>
  );
}
