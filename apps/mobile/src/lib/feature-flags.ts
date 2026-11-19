// Recursos ligados por variável de ambiente (EXPO_PUBLIC_*, visível no bundle). Diferente de env.ts,
// não lança erro quando a variável falta: o padrão é desligado.

export const featureFlags = {
  // Login com Google (RNF06): ligue só depois de configurar o provedor Google no Supabase.
  googleAuth: process.env.EXPO_PUBLIC_GOOGLE_AUTH_ENABLED === 'true',
} as const;
