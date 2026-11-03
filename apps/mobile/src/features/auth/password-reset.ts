// AUT-04: recuperação de senha. Domínio puro: sem React, Expo ou Supabase.

/**
 * Mensagem única de confirmação. É exibida sempre que o pedido é aceito, exista ou não uma
 * conta com o e-mail, para a tela não revelar quais e-mails estão cadastrados (enumeração).
 */
export const PASSWORD_RESET_CONFIRMATION =
  'Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha.';

/**
 * Para onde o link do e-mail leva de volta ao app. Precisa constar em
 * auth.additional_redirect_urls (supabase/config.toml já libera destrava://**).
 */
export const PASSWORD_RESET_REDIRECT_URL = 'destrava://reset-password';
