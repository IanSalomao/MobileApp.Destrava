// Só variáveis com prefixo EXPO_PUBLIC_ chegam ao app, e elas ficam visíveis no bundle.
// Nunca coloque aqui segredos como a service_role key do Supabase.

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY em apps/mobile/.env (veja .env.example).',
  );
}

export const env = {
  supabaseUrl,
  supabasePublishableKey,
} as const;
