// Tokens visuais do app. Cores tiradas da identidade da apresentação (verde-petróleo e sálvia).
// Use sempre estes tokens nos StyleSheets em vez de valores soltos.

export const colors = {
  primary: '#13454F',
  primaryPressed: '#0D333B',
  onPrimary: '#FFFFFF',
  accent: '#ABAF96',
  accentSoft: '#E7EAE1',
  background: '#F5F6F3',
  surface: '#FFFFFF',
  text: '#16242A',
  textMuted: '#5B6B70',
  border: '#D6DCD8',
  danger: '#B3261E',
  success: '#2E7D4F',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
} as const;

export const typography = {
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  subtitle: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
} as const;

export type ColorToken = keyof typeof colors;
export type TypographyVariant = keyof typeof typography;
