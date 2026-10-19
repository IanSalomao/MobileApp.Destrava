// Tokens oficiais do Design System Destrava extraídos do Figma (UI-01).
// Regra: nunca utilize cores hexadecimais ou números mágicos soltos nos StyleSheets.

export const colors = {
  // Identidade Principal (Verde Destrava do Figma)
  primary: '#1B7F4E',
  primaryPressed: '#135E38',
  primarySoft: '#E8F5EE',
  primaryBorder: '#A7D7BE',
  onPrimary: '#FFFFFF',

  // Secundárias / Apoio (compatibilidade + destaque)
  accent: '#1B7F4E',
  accentSoft: '#E8F5EE',

  // Fundos e Superfícies
  background: '#FFFFFF',
  backgroundSubtle: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F4F6',

  // Tipografia / Textos
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  textPlaceholder: '#9CA3AF',

  // Bordas e Divisores
  border: '#E5E7EB',
  borderFocus: '#1B7F4E',

  // Semânticas: Erro / Perigo
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  dangerBorder: '#FECACA',

  // Semânticas: Sucesso
  success: '#15803D',
  successSoft: '#DCFCE7',
  successBorder: '#BBF7D0',

  // Semânticas: Aviso / Estrelas de Avaliação
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  warningBorder: '#FDE68A',
  star: '#F59E0B',

  // Semânticas: Informativo (Banner "Contato seguro" e "Revisão do perfil" no Figma)
  info: '#1D4ED8',
  infoSoft: '#EEF4FF',
  infoBorder: '#C7D7FE',

  // Estados Desabilitados
  disabledBackground: '#E5E7EB',
  disabledText: '#9CA3AF',

  transparent: 'rgba(0, 0, 0, 0)',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  heading: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
  subtitle: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
} as const;

export const layout = {
  minTouchTarget: 44, // Requisito de acessibilidade (>= 44pt)
  buttonHeight: 48,
  inputHeight: 48,
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  layout,
} as const;

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type TypographyVariant = keyof typeof typography;
export type AppTheme = typeof theme;
