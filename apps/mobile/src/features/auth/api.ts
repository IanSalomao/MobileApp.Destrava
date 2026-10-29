import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

import type { SignInInput, SignUpInput } from './schemas';

export interface AuthRepository {
  signIn(credentials: SignInInput): Promise<unknown>;
}

export async function signIn({ email, password }: SignInInput) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export const defaultAuthRepository: AuthRepository = {
  signIn,
};

export async function signUp({ fullName, email, password, role }: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Avisa sobre a sessão atual (evento inicial) e sobre cada login, logout ou renovação de token. */
export function onSessionChange(callback: (session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}
