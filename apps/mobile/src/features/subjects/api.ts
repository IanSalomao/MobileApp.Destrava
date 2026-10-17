import { supabase } from '@/lib/supabase';

import type { Subject } from './types';

// Model/repositório da feature: o único lugar que fala com o Supabase.
// Deixa o erro do Supabase subir (quem traduz é o hook) e devolve dados tipados.

/** Lista as matérias do catálogo. Leitura pública (inclusive visitante anônimo). */
export async function listSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase.from('subjects').select('id, name').order('sort_order');

  if (error) throw error;
  return data;
}
