import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

import { buildSignUpMetadata } from './consent';
import { PASSWORD_RESET_REDIRECT_URL } from './password-reset';
import type { ForgotPasswordInput, SignInInput, SignUpInput } from './schemas';
export interface AuthRepository {
  signIn(credentials: SignInInput): Promise<unknown>;
  requestPasswordReset(input: ForgotPasswordInput): Promise<void>;
}

export async function signIn({ email, password }: SignInInput) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// O Supabase responde com sucesso mesmo quando o e-mail não existe, então este pedido não revela contas.
export async function requestPasswordReset({ email }: ForgotPasswordInput) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: PASSWORD_RESET_REDIRECT_URL,
  });
  if (error) throw error;
}

export const defaultAuthRepository: AuthRepository = {
  signIn,
  requestPasswordReset,
};

export async function signUp({ fullName, email, phone, password, role }: SignUpInput) {
  // termsAccepted e minorDataConsent já foram exigidos pelo schema; o aceite e o celular seguem nos
  // metadados, que o trigger handle_new_user lê para criar profiles e contact_details.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: buildSignUpMetadata({ fullName, role, phone }) },
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
