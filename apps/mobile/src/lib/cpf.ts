import { onlyDigits } from './masks';

// Validação dos dígitos verificadores do CPF, espelhando public.is_valid_cpf do banco, para dar o
// erro na hora (o banco é a barreira final).
export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digitAt = (length: number): number => {
    let total = 0;
    for (let i = 0; i < length; i += 1) {
      total += Number(cpf[i]) * (length + 1 - i);
    }
    return ((total * 10) % 11) % 10;
  };

  return digitAt(9) === Number(cpf[9]) && digitAt(10) === Number(cpf[10]);
}
