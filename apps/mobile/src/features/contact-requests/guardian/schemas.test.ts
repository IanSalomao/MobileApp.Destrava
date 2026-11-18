import { contactRequestSchema, NEW_STUDENT_CHOICE, REASON_MAX_LENGTH } from './schemas';

const VALID = {
  guardianName: 'Juliana Martins',
  studentChoice: NEW_STUDENT_CHOICE,
  studentName: 'Lucas Martins',
  schoolGrade: 'elementary_7',
  studentAge: '12',
  tutoringPreference: 'online',
  reason: 'Reforço em frações.',
};

function firstMessage(input: unknown): string | undefined {
  const result = contactRequestSchema.safeParse(input);
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('contactRequestSchema (RF07)', () => {
  it('aceita um formulário completo', () => {
    expect(contactRequestSchema.safeParse(VALID).success).toBe(true);
  });

  it('aceita a idade vazia (campo opcional)', () => {
    expect(contactRequestSchema.safeParse({ ...VALID, studentAge: '' }).success).toBe(true);
  });

  it('exige o nome do responsável', () => {
    expect(firstMessage({ ...VALID, guardianName: '   ' })).toBe('Informe o seu nome.');
  });

  it('exige o nome do aluno', () => {
    expect(firstMessage({ ...VALID, studentName: '' })).toBe('Informe o nome do aluno.');
  });

  it('exige o ano escolar', () => {
    expect(firstMessage({ ...VALID, schoolGrade: undefined })).toBe('Selecione o ano escolar.');
  });

  it('exige o motivo do reforço', () => {
    expect(firstMessage({ ...VALID, reason: '  ' })).toBe('Conte o motivo do reforço.');
  });

  it('limita o motivo a 1000 caracteres', () => {
    const reason = 'a'.repeat(REASON_MAX_LENGTH + 1);

    expect(firstMessage({ ...VALID, reason })).toBe('Use no máximo 1000 caracteres.');
    expect(
      contactRequestSchema.safeParse({ ...VALID, reason: 'a'.repeat(REASON_MAX_LENGTH) }).success,
    ).toBe(true);
  });

  it.each(['2', '26', '1a', '-5'])('recusa a idade "%s"', (studentAge) => {
    expect(firstMessage({ ...VALID, studentAge })).toBe('Informe uma idade entre 3 e 25 anos.');
  });

  it.each(['3', '25'])('aceita a idade "%s" (limites do banco)', (studentAge) => {
    expect(contactRequestSchema.safeParse({ ...VALID, studentAge }).success).toBe(true);
  });

  it('recusa uma preferência de aula desconhecida', () => {
    expect(contactRequestSchema.safeParse({ ...VALID, tutoringPreference: 'hybrid' }).success).toBe(
      false,
    );
  });
});