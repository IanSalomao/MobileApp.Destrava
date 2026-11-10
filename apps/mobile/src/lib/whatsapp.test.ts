import { buildWhatsAppUrl } from './whatsapp';

describe('buildWhatsAppUrl', () => {
  it('monta o link com o número sem o + e a mensagem codificada', () => {
    expect(buildWhatsAppUrl('+5511970000001', 'Olá, tudo bem?')).toBe(
      'https://wa.me/5511970000001?text=Ol%C3%A1%2C%20tudo%20bem%3F',
    );
  });

  it('remove formatação do telefone', () => {
    expect(buildWhatsAppUrl('+55 (11) 97000-0001', 'Oi')).toBe(
      'https://wa.me/5511970000001?text=Oi',
    );
  });

  it('devolve null quando o telefone não tem dígitos suficientes', () => {
    expect(buildWhatsAppUrl('', 'Oi')).toBeNull();
    expect(buildWhatsAppUrl('+5511', 'Oi')).toBeNull();
  });
});
