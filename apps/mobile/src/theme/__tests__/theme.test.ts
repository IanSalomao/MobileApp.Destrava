// apps/mobile/src/theme/__tests__/theme.test.ts
import { colors, spacing, radius, typography, layout, theme } from '../index';

const VALID_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$|^rgba?\(/;

export function assertThemeIntegrity(): void {
  // 1. Nenhuma cor vazia ou fora do padrão hexadecimal/rgba
  for (const [key, value] of Object.entries(colors)) {
    if (!VALID_COLOR_REGEX.test(value)) {
      throw new Error(`Token de cor inválido em colors.${key}: ${value}`);
    }
  }

  // 2. Garantir requisito de área mínima de toque (>= 44pt)
  if (layout.minTouchTarget < 44) {
    throw new Error(`minTouchTarget deve ser >= 44pt, recebido: ${layout.minTouchTarget}`);
  }

  // 3. Garantir progressão positiva de espaçamentos e raios
  if (!(spacing.xs < spacing.sm && spacing.sm < spacing.md && spacing.md < spacing.lg)) {
    throw new Error('Escala de spacing inconsistente.');
  }

  if (!(radius.sm < radius.md && radius.md < radius.lg && radius.lg < radius.full)) {
    throw new Error('Escala de radius inconsistente.');
  }

  // 4. Garantir que o objeto theme agrega todas as dimensões
  if (theme.colors.primary !== '#1B7F4E' || !theme.typography.title.fontSize) {
    throw new Error('Objeto theme principal incompleto.');
  }
}

describe('UI-01: Theme Tokens', () => {
  it('valida a integridade de todos os tokens do tema', () => {
    expect(() => assertThemeIntegrity()).not.toThrow();
  });
});
