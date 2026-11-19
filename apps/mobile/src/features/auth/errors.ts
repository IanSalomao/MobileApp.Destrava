import { isAuthError } from '@supabase/supabase-js';

export const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha inválidos';

// Códigos documentados em https://supabase.com/docs/guides/auth/debugging/error-codes
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: INVALID_CREDENTIALS_MESSAGE,
  invalid_grant: INVALID_CREDENTIALS_MESSAGE,
  email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
  user_already_exists: 'Já existe uma conta com este e-mail.',
  email_exists: 'Já existe uma conta com este e-mail.',
  weak_password: 'Escolha uma senha mais forte.',
  over_request_rate_limit: 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  over_email_send_rate_limit: 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  signup_disabled: 'O cadastro está temporariamente desativado.',
};

type ErrorWithCode = {
  code?: string;
  name?: string;
};

export function getAuthErrorMessage(error: unknown): string {
  if (isAuthError(error) && error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }

  if (typeof error === 'object' && error !== null) {
    const { code, name } = error as ErrorWithCode;
    if (code && AUTH_ERROR_MESSAGES[code]) {
      return AUTH_ERROR_MESSAGES[code];
    }
    if (name === 'InvalidCredentialsError') {
      return INVALID_CREDENTIALS_MESSAGE;
    }
  }

  return 'Não foi possível concluir agora. Verifique sua conexão e tente de novo.';
}
