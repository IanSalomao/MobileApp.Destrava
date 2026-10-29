// apps/mobile/src/theme/__tests__/theme.test.ts
import { colors, spacing, radius, typography, layout, theme } from '../index';

const VALID_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$|^rgba?\(/;

describe('UI-01: Theme Integrity & Tokens Contract', () => {
  it('deve garantir que nenhuma cor seja vazia ou esteja fora do formato hexadecimal/rgba', () => {
    for (const [key, value] of Object.entries(colors)) {
      expect(value).toMatch(VALID_COLOR_REGEX);
    }
  });

  it('deve garantir requisito de área mínima de toque (>= 44pt)', () => {
    expect(layout.minTouchTarget).toBeGreaterThanOrEqual(44);
  });

  it('deve garantir progressão positiva de espaçamentos e raios', () => {
    expect(spacing.xs).toBeLessThan(spacing.sm);
    expect(spacing.sm).toBeLessThan(spacing.md);
    expect(spacing.md).toBeLessThan(spacing.lg);

    expect(radius.sm).toBeLessThan(radius.md);
    expect(radius.md).toBeLessThan(radius.lg);
    expect(radius.lg).toBeLessThan(radius.full);
  });

  it('deve garantir que o objeto theme agrega todas as dimensões e valores principais', () => {
    expect(theme.colors.primary).toBe('#1B7F4E');
    expect(theme.typography.title.fontSize).toBeDefined();
  });
});
