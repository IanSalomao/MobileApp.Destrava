// Máscaras de apresentação para os campos de formulário. Puras: recebem e devolvem string.
// O valor "limpo" (só dígitos / em centavos) é derivado por helpers separados antes de enviar.

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Celular brasileiro: "(11) 99999-1234". Aceita 10 ou 11 dígitos (com DDD). */
export function maskPhoneBR(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** CPF: "123.456.789-09". */
export function maskCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean);
  const base = parts.join('.');
  const check = digits.slice(9, 11);
  return check ? `${base}-${check}` : base;
}

/** Número do cartão em grupos de 4: "0000 0000 0000 0000". */
export function maskCardNumber(value: string): string {
  const digits = onlyDigits(value).slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

/** Validade do cartão: "MM/AA". */
export function maskCardExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Valor em reais a partir dos dígitos digitados, tratados como centavos: 6500 -> "65,00". */
export function maskCurrencyBRL(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  if (!digits) return '';
  const cents = Number(digits);
  const reais = Math.floor(cents / 100);
  const remainder = String(cents % 100).padStart(2, '0');
  const reaisWithThousands = reais.toLocaleString('pt-BR');
  return `${reaisWithThousands},${remainder}`;
}

/** Converte o texto mascarado de reais em centavos (inteiro) ou null se vazio. */
export function currencyToCents(masked: string): number | null {
  const digits = onlyDigits(masked);
  return digits ? Number(digits) : null;
}
