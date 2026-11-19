import { formatGuardianSubtitle, toPhoneInput, withAvatarVersion } from './domain';

describe('toPhoneInput', () => {
  it('mostra o celular brasileiro em E.164 com a máscara do campo', () => {
    expect(toPhoneInput('+5511999991234')).toBe('(11) 99999-1234');
    expect(toPhoneInput('+551133334444')).toBe('(11) 3333-4444');
  });

  it('sem celular salvo, o campo começa vazio', () => {
    expect(toPhoneInput(null)).toBe('');
    expect(toPhoneInput(undefined)).toBe('');
  });

  it('número de outro país vira só os dígitos mascarados', () => {
    expect(toPhoneInput('+351912345678')).toBe('(35) 19123-4567');
  });
});

describe('formatGuardianSubtitle', () => {
  it('cita o primeiro nome do aluno', () => {
    expect(formatGuardianSubtitle(['Gabriel Martins'])).toBe('Responsável por Gabriel');
  });

  it('com mais de um aluno, cita o primeiro e quantos mais', () => {
    expect(formatGuardianSubtitle(['Gabriel Martins', 'Ana Martins', 'Rui'])).toBe(
      'Responsável por Gabriel e mais 2',
    );
  });

  it('sem aluno, fica só "Responsável"', () => {
    expect(formatGuardianSubtitle([])).toBe('Responsável');
    expect(formatGuardianSubtitle(['   '])).toBe('Responsável');
  });
});

describe('withAvatarVersion', () => {
  it('acrescenta a versão na URL pública', () => {
    expect(withAvatarVersion('https://x.supabase.co/a/avatar.jpg', 42)).toBe(
      'https://x.supabase.co/a/avatar.jpg?v=42',
    );
  });

  it('respeita parâmetros que a URL já tem', () => {
    expect(withAvatarVersion('https://x.supabase.co/a/avatar.jpg?t=1', 42)).toBe(
      'https://x.supabase.co/a/avatar.jpg?t=1&v=42',
    );
  });
});
