import { supabase } from '@/lib/supabase';

import type { ContactRequestPayload } from './domain';

// Model/repositório do lado do responsável nas solicitações de contato: único lugar desta pasta que
// fala com o Supabase. O guardian_id vem do default auth.uid() da tabela, e o RLS só deixa enviar
// para professor publicado e com um aluno do próprio responsável. Deixa o erro do Supabase subir
// (quem traduz é o hook).

/** Envia a solicitação (status inicial pending, prazo de 24 h definido pelo banco). */
export async function createContactRequest(
  payload: ContactRequestPayload,
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('contact_requests')
    .insert(payload)
    .select('id')
    .single();

  if (error) throw error;
  return data;
}