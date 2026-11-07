import { supabase } from '@/lib/supabase';

import type { Language } from './types';

// Model/repositório do catálogo de idiomas: único lugar que fala com o Supabase. Leitura pública.
export async function listLanguages(): Promise<Language[]> {
  const { data, error } = await supabase.from('languages').select('id, name').order('sort_order');

  if (error) throw error;
  return data;
}
