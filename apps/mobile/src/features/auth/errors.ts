import { isAuthError } from '@supabase/supabase-js';

// Códigos documentados em https://supabase.com/docs/guides/auth/debugging/error-codes
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
  user_already_exists: 'Já existe uma conta com este e-mail.',
  email_exists: 'Já existe uma conta com este e-mail.',
  weak_password: 'Escolha uma senha mais forte.',
  over_request_rate_limit: 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  over_email_send_rate_limit: 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  signup_disabled: 'O cadastro está temporariamente desativado.',
};

export function getAuthErrorMessage(error: unknown): string {
  if (isAuthError(error) && error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }
  return 'Não foi possível concluir agora. Verifique sua conexão e tente de novo.';
}
