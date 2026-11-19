import {
  isValidSocialUrl,
  isVerificationEditable,
  normalizeSocialUrl,
  toTeacherProfileFormValues,
} from './domain';
import type { MyTeacherProfile } from './types';

const PROFILE: MyTeacherProfile = {
  id: 't1',
  fullName: 'Mariana Alves',
  avatarUrl: null,
  bio: 'Professora há 8 anos.',
  hourlyRateCents: 6500,
  tutoringTypes: ['online'],
  weekdays: [1, 3],
  periods: ['morning'],
  state: 'SP',
  cityId: 3550308,
  cityName: 'São Paulo',
  isPublished: true,
  ratingAverage: 4.9,
  ratingCount: 12,
  subjects: [{ id: 'math', name: 'Matemática' }],
  languages: [{ id: 'pt', name: 'Português' }],
  socialLinks: [{ network: 'linkedin', url: 'https://linkedin.com/in/mariana' }],
  verificationStatus: 'approved',
  cpf: '52998224725',
  identityDocumentName: 'rg.pdf',
  certificateNames: [],
};

describe('isVerificationEditable', () => {
  it('libera CPF e documento só antes do envio ou depois de recusa', () => {
    expect(isVerificationEditable('draft')).toBe(true);
    expect(isVerificationEditable('rejected')).toBe(true);
    expect(isVerificationEditable('pending_review')).toBe(false);
    expect(isVerificationEditable('approved')).toBe(false);
  });
});

describe('normalizeSocialUrl', () => {
  it('completa o https:// e troca http por https', () => {
    expect(normalizeSocialUrl('instagram.com/ana')).toBe('https://instagram.com/ana');
    expect(normalizeSocialUrl(' http://site.com.br ')).toBe('https://site.com.br');
    expect(normalizeSocialUrl('https://x.com/a')).toBe('https://x.com/a');
    expect(normalizeSocialUrl('   ')).toBe('');
  });
});

describe('isValidSocialUrl', () => {
  it('aceita domínios com ou sem caminho', () => {
    expect(isValidSocialUrl('instagram.com/ana')).toBe(true);
    expect(isValidSocialUrl('https://www.linkedin.com/in/ana-souza')).toBe(true);
  });

  it('recusa texto sem domínio, vazio ou longo demais', () => {
    expect(isValidSocialUrl('ana')).toBe(false);
    expect(isValidSocialUrl('')).toBe(false);
    expect(isValidSocialUrl(`site.com/${'a'.repeat(300)}`)).toBe(false);
  });
});

describe('toTeacherProfileFormValues', () => {
  it('converte o perfil salvo nos valores do formulário', () => {
    expect(toTeacherProfileFormValues(PROFILE)).toEqual({
      fullName: 'Mariana Alves',
      cpf: '529.982.247-25',
      state: 'SP',
      cityId: 3550308,
      subjectIds: ['math'],
      languageIds: ['pt'],
      bio: 'Professora há 8 anos.',
      tutoringTypes: ['online'],
      hourlyRate: '65,00',
      weekdays: [1, 3],
      periods: ['morning'],
      socialNetwork: 'linkedin',
      socialUrl: 'https://linkedin.com/in/mariana',
    });
  });

  it('deixa vazio o que ainda não foi preenchido', () => {
    const values = toTeacherProfileFormValues({
      ...PROFILE,
      bio: null,
      cpf: null,
      hourlyRateCents: null,
      socialLinks: [],
      state: null,
      cityId: null,
    });

    expect(values).toMatchObject({
      bio: '',
      cpf: '',
      hourlyRate: '',
      socialNetwork: 'instagram',
      socialUrl: '',
      state: undefined,
      cityId: undefined,
    });
  });
});
