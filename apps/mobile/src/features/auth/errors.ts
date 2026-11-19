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
  // Escolha de papel (RPC complete_role_choice): erros de regra chegam em error.message.
  role_already_chosen: 'Seu perfil já foi definido. Entre de novo para continuar.',
  minor_data_consent_required: 'Autorize o uso dos dados do aluno para continuar.',
  terms_not_accepted: 'Aceite os Termos e a Política para continuar.',
  invalid_phone: 'Informe um celular válido com DDD.',
  // Login com Google.
  provider_disabled: 'O login com Google ainda não está disponível.',
  validation_failed: 'O login com Google ainda não está disponível.',
};

type ErrorWithCode = {
  code?: string;
  name?: string;
  message?: string;
};

export function getAuthErrorMessage(error: unknown): string {
  if (isAuthError(error) && error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }

  if (typeof error === 'object' && error !== null) {
    const { code, name, message } = error as ErrorWithCode;
    if (code && AUTH_ERROR_MESSAGES[code]) {
      return AUTH_ERROR_MESSAGES[code];
    }
    // Erros de regra do banco (raise exception) vêm com o código na mensagem.
    if (message && AUTH_ERROR_MESSAGES[message]) {
      return AUTH_ERROR_MESSAGES[message];
    }
    if (name === 'InvalidCredentialsError') {
      return INVALID_CREDENTIALS_MESSAGE;
    }
  }

  return 'Não foi possível concluir agora. Verifique sua conexão e tente de novo.';
}
