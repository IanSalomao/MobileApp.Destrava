import { translateDbError } from '@/lib/db-errors';

// Erros do "Meu perfil": salvar nome e celular e trocar a foto.

// Check do banco (nome com mais de 120 caracteres ou celular fora do E.164).
const CHECK_VIOLATION = '23514';
// O Storage responde 413 para arquivo maior que o limite do bucket (5 MB) e 415 para formato
// fora de JPG/PNG. Dependendo da versão, o código vem em status (número) ou statusCode (texto).
const PAYLOAD_TOO_LARGE = '413';
const UNSUPPORTED_MEDIA_TYPE = '415';

const PROFILE_ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: 'Sua sessão expirou. Entre de novo para salvar.',
  invalid_phone: 'Informe um celular válido com DDD.',
};

function getErrorCodes(error: unknown): string[] {
  if (typeof error !== 'object' || error === null) return [];
  const { code, status, statusCode } = error as {
    code?: unknown;
    status?: unknown;
    statusCode?: unknown;
  };
  return [code, status, statusCode]
    .filter((value) => typeof value === 'string' || typeof value === 'number')
    .map(String);
}

/** Mensagem em pt-BR para uma falha ao salvar os dados ou a foto do perfil. */
export function getProfileErrorMessage(error: unknown): string {
  const codes = getErrorCodes(error);
  if (codes.includes(CHECK_VIOLATION)) {
    return 'Confira os dados: nome com até 120 caracteres e celular com DDD.';
  }
  if (codes.includes(PAYLOAD_TOO_LARGE)) {
    return 'A foto passa de 5 MB. Escolha uma imagem menor.';
  }
  if (codes.includes(UNSUPPORTED_MEDIA_TYPE)) {
    return 'Use uma foto em JPG ou PNG.';
  }
  return translateDbError(error, PROFILE_ERROR_MESSAGES);
}
