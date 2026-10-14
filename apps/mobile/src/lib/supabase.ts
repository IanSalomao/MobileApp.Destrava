import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from './database.types';
import { env } from './env';
import { LargeSecureStore } from './secure-storage';

// Cliente único do Supabase. Só os arquivos api.ts das features devem importá-lo.
export const supabase = createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    // SecureStore não existe na web; lá a sessão fica no localStorage (via AsyncStorage).
    storage: Platform.OS === 'web' ? AsyncStorage : new LargeSecureStore(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// No celular, o token só é renovado com o app em primeiro plano.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
