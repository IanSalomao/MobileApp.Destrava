import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import type { UserRole } from '@/features/profile/types';
import { toE164BR } from '@/lib/phone';
import { supabase } from '@/lib/supabase';

import { buildSignUpMetadata, TERMS_VERSION } from './consent';
import { parseOAuthCallback } from './oauth';
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

/**
 * Login com Google (RNF06). Abre o Google no navegador do sistema e, na volta, grava a sessão.
 * Devolve null se o usuário fechou o navegador. Conta nova pelo Google nasce sem papel: a guarda de
 * rotas leva para /choose-role.
 */
export async function signInWithGoogle(): Promise<Session | null> {
  const redirectTo = Linking.createURL('/');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return null;

  const callback = parseOAuthCallback(result.url);
  if (callback.type === 'error') throw new Error(callback.message);

  if (callback.type === 'code') {
    const { data: exchanged, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      callback.code,
    );
    if (exchangeError) throw exchangeError;
    return exchanged.session;
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token: callback.accessToken,
    refresh_token: callback.refreshToken,
  });
  if (sessionError) throw sessionError;
  return sessionData.session;
}

export type CompleteRoleChoiceInput = {
  role: UserRole;
  phone: string;
};

/**
 * Escolha de papel de quem entrou pelo Google: grava papel, aceite dos Termos (versão atual),
 * consentimento de dados do menor (responsável) e celular. O aceite já foi exigido pelo formulário.
 */
export async function completeRoleChoice({ role, phone }: CompleteRoleChoiceInput) {
  const e164 = toE164BR(phone);
  const { data, error } = await supabase.rpc('complete_role_choice', {
    p_role: role,
    p_terms_version: TERMS_VERSION,
    p_minor_data_consent: role === 'guardian',
    ...(e164 ? { p_phone: e164 } : {}),
  });
  if (error) throw error;
  return data;
}
