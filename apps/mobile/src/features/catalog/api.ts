import { supabase } from '@/lib/supabase';

import type { BrazilianState, City, Language } from './types';

// Model/repositório do catálogo (idiomas e municípios): único lugar que fala com o Supabase.
export async function listLanguages(): Promise<Language[]> {
  const { data, error } = await supabase.from('languages').select('id, name').order('sort_order');

  if (error) throw error;
  return data;
}

/** Municípios de um estado em ordem alfabética. O maior estado (MG) tem 853, abaixo do max_rows. */
export async function listCities(state: BrazilianState): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('id, name')
    .eq('state', state)
    .order('name');

  if (error) throw error;
  return data;
}
