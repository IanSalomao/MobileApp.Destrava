import { supabase } from '@/lib/supabase';

import type { Profile } from './types';

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, avatar_url')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}
