import { getStudentErrorMessage } from './errors';

describe('getStudentErrorMessage', () => {
  it('traduz o aluno não encontrado', () => {
    expect(getStudentErrorMessage(new Error('student_not_found'))).toBe('Aluno não encontrado.');
  });

  it('erro desconhecido ou de rede cai na mensagem genérica', () => {
    const generic = 'Não foi possível concluir agora. Verifique sua conexão e tente de novo.';

    expect(getStudentErrorMessage(new Error('Network request failed'))).toBe(generic);
    expect(getStudentErrorMessage(null)).toBe(generic);
  });
});
