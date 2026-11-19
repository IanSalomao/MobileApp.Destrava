import { reviewSchema } from './schemas';

describe('reviewSchema', () => {
  it('aceita nota de 1 a 5 com ou sem comentário', () => {
    expect(reviewSchema.safeParse({ rating: 1, comment: '' }).success).toBe(true);
    expect(reviewSchema.safeParse({ rating: 5, comment: 'Ótima aula.' }).success).toBe(true);
  });

  it('exige a nota (0 = nenhuma estrela marcada)', () => {
    const result = reviewSchema.safeParse({ rating: 0, comment: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Escolha uma nota de 1 a 5 estrelas.');
  });

  it('recusa nota acima de 5', () => {
    expect(reviewSchema.safeParse({ rating: 6, comment: '' }).success).toBe(false);
  });

  it('limita o comentário a 1000 caracteres (sem contar os espaços das pontas)', () => {
    expect(reviewSchema.safeParse({ rating: 4, comment: 'a'.repeat(1001) }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 4, comment: ` ${'a'.repeat(1000)} ` }).success).toBe(
      true,
    );
  });
});
