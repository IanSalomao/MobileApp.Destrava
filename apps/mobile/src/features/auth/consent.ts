import { toE164BR } from '@/lib/phone';

import type { SignUpInput } from './schemas';

// AUT-09: consentimento (LGPD). Domínio puro: sem React, Expo ou Supabase.

/** Versão dos Termos de Uso e da Política de Privacidade exibida no cadastro. Mude ao revisar os textos. */
export const TERMS_VERSION = '2026-10';

export const TERMS_REQUIRED_MESSAGE = 'Aceite os Termos e a Política para criar a conta.';
export const MINOR_DATA_REQUIRED_MESSAGE =
  'Autorize o uso dos dados do aluno para criar a conta de responsável.';

/** Cláusula específica de responsável (dados de menor de idade, LGPD art. 14). */
export const MINOR_DATA_CLAUSE =
  'Sou o responsável legal pelo aluno e autorizo o Destrava a tratar os dados básicos dele (nome e ano escolar), menor de idade, apenas para enviar o pedido de contato ao professor que eu escolher.';

/**
 * Metadados enviados no signUp (options.data). O trigger handle_new_user lê estes campos,
 * recusa o cadastro sem o aceite e grava versão, data e papel em profiles.
 */
export function buildSignUpMetadata({
  fullName,
  role,
  phone,
}: Pick<SignUpInput, 'fullName' | 'role' | 'phone'>) {
  const e164 = toE164BR(phone);
  return {
    full_name: fullName,
    role,
    terms_accepted: true,
    terms_version: TERMS_VERSION,
    // E.164 para o botão do WhatsApp (RF09). Inválido fica nulo no banco; o usuário corrige no perfil.
    ...(e164 ? { phone: e164 } : {}),
    ...(role === 'guardian' ? { minor_data_consent: true } : {}),
  };
}
