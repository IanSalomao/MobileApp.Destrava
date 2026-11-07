import {
  buildSignUpMetadata,
  MINOR_DATA_REQUIRED_MESSAGE,
  TERMS_REQUIRED_MESSAGE,
  TERMS_VERSION,
} from '../consent';
import { signUpSchema } from '../schemas';

const baseInput = {
  fullName: 'Maria Souza',
  email: 'maria@destrava.com',
  phone: '11999991234',
  password: 'senha-segura-1',
  termsAccepted: true,
  minorDataConsent: false,
};

function errorsOf(input: unknown) {
  const result = signUpSchema.safeParse(input);
  return result.success ? null : result.error.flatten().fieldErrors;
}

describe('AUT-09: aceite de Termos e Política no cadastro', () => {
  it('recusa o cadastro sem o aceite dos Termos', () => {
    const fieldErrors = errorsOf({ ...baseInput, role: 'teacher', termsAccepted: false });

    expect(fieldErrors?.termsAccepted).toContain(TERMS_REQUIRED_MESSAGE);
  });

  it('aceita professor com o aceite, sem exigir a cláusula do menor', () => {
    expect(signUpSchema.safeParse({ ...baseInput, role: 'teacher' }).success).toBe(true);
  });

  it('recusa responsável que não autorizou os dados do aluno menor de idade', () => {
    const fieldErrors = errorsOf({ ...baseInput, role: 'guardian', minorDataConsent: false });

    expect(fieldErrors?.minorDataConsent).toContain(MINOR_DATA_REQUIRED_MESSAGE);
  });

  it('aceita responsável com os dois consentimentos', () => {
    const result = signUpSchema.safeParse({
      ...baseInput,
      role: 'guardian',
      minorDataConsent: true,
    });

    expect(result.success).toBe(true);
  });
});

describe('AUT-09: buildSignUpMetadata (o que o banco grava como prova)', () => {
  it('professor: envia aceite, versão e celular em E.164, sem consentimento de menor', () => {
    expect(buildSignUpMetadata({ fullName: 'Ana', role: 'teacher', phone: '11999991234' })).toEqual(
      {
        full_name: 'Ana',
        role: 'teacher',
        terms_accepted: true,
        terms_version: TERMS_VERSION,
        phone: '+5511999991234',
      },
    );
  });

  it('responsável: envia também o consentimento sobre dados do menor', () => {
    expect(
      buildSignUpMetadata({ fullName: 'Bia', role: 'guardian', phone: '11999991234' }),
    ).toEqual({
      full_name: 'Bia',
      role: 'guardian',
      terms_accepted: true,
      terms_version: TERMS_VERSION,
      phone: '+5511999991234',
      minor_data_consent: true,
    });
  });

  it('celular inválido não entra nos metadados (o banco o deixaria nulo)', () => {
    expect(
      buildSignUpMetadata({ fullName: 'Caio', role: 'teacher', phone: '123' }),
    ).not.toHaveProperty('phone');
  });
});
