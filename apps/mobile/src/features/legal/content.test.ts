import { readFileSync } from 'fs';
import { resolve } from 'path';

import { TERMS_VERSION } from '@/features/auth/consent';

import {
  LEGAL_VERSION_DATE,
  PRIVACY_CONTROLLER,
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
  PRIVACY_TITLE,
  TERMS_INTRO,
  TERMS_SECTIONS,
  TERMS_TITLE,
} from './content';
import type { LegalSection } from './types';

const DOCS_DIR = resolve(process.cwd(), '../../docs/legal');

function normalizeMarkdown(markdown: string): string[] {
  return markdown
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line
        .replace(/^#{1,6}\s+/, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^-\s+/, ''),
    );
}

function buildLines(
  title: string,
  intro: string,
  controller: string | null,
  sections: LegalSection[],
): string[] {
  return [
    title,
    `Versão ${TERMS_VERSION} · vigente desde ${LEGAL_VERSION_DATE}`,
    intro,
    ...(controller ? [controller] : []),
    ...sections.flatMap((section) => [
      section.title,
      ...(section.paragraphs ?? []),
      ...(section.bullets ?? []),
    ]),
  ];
}

function readDoc(fileName: string): string[] {
  return normalizeMarkdown(readFileSync(resolve(DOCS_DIR, fileName), 'utf8'));
}

describe('conteúdo legal em sincronia com docs/legal', () => {
  it('Termos de Uso', () => {
    expect(readDoc('termos-de-uso.md')).toEqual(
      buildLines(TERMS_TITLE, TERMS_INTRO, null, TERMS_SECTIONS),
    );
  });

  it('Política de Privacidade', () => {
    expect(readDoc('politica-de-privacidade.md')).toEqual(
      buildLines(PRIVACY_TITLE, PRIVACY_INTRO, PRIVACY_CONTROLLER, PRIVACY_SECTIONS),
    );
  });
});
