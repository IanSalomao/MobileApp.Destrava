import type { Enums } from '@/lib/database.types';
import { extensionForContentType, type PickedFile } from '@/lib/file-picker';
import { onlyDigits } from '@/lib/masks';
import { uploadToBucket } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

import { isVerificationEditable, normalizeSocialUrl } from './domain';
import type { MyTeacherProfile, SocialLink, VerificationStatus } from './types';

// Model/repositório da feature: único lugar que fala com o Supabase. Grava o cadastro profissional
// (perfil, verificação, matérias, idiomas, documentos) e envia para análise. Deixa o erro subir;
// quem traduz é o hook.

const AVATARS_BUCKET = 'avatars';
const DOCUMENTS_BUCKET = 'teacher-documents';

async function uploadAvatar(teacherId: string, file: PickedFile): Promise<void> {
  const ext = extensionForContentType(file.contentType);
  const path = await uploadToBucket({
    bucket: AVATARS_BUCKET,
    path: `${teacherId}/avatar.${ext}`,
    base64: file.base64,
    contentType: file.contentType,
    upsert: true,
  });

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', teacherId);
  if (error) throw error;
}

async function uploadTeacherDocument(
  teacherId: string,
  kind: Enums<'teacher_document_kind'>,
  file: PickedFile,
): Promise<void> {
  const ext = extensionForContentType(file.contentType);
  const path = await uploadToBucket({
    bucket: DOCUMENTS_BUCKET,
    path: `${teacherId}/${kind}-${Date.now()}.${ext}`,
    base64: file.base64,
    contentType: file.contentType,
  });

  // teacher_id vem do default auth.uid() (a coluna não é liberada para insert).
  const { error } = await supabase
    .from('teacher_documents')
    .insert({ kind, storage_path: path, file_name: file.fileName });
  if (error) throw error;
}

export type SaveTeacherProfileParams = {
  teacherId: string;
  fullName: string;
  cpf: string;
  state: Enums<'brazilian_state'>;
  /** Código IBGE do município (public.cities), do mesmo estado de state. */
  cityId: number;
  neighborhood: string;
  subjectIds: string[];
  languageIds: string[];
  bio?: string;
  tutoringTypes: Enums<'tutoring_type'>[];
  hourlyRateCents: number;
  weekdays: number[];
  periods: Enums<'day_period'>[];
  /** Link de rede social (RF11). Nulo remove o link salvo. */
  socialLink?: SocialLink | null;
  avatar?: PickedFile | null;
  identityDocument?: PickedFile | null;
  certificates?: PickedFile[];
};

type SaveOptions = {
  /** CPF e documento de identidade só podem mudar antes do envio ou depois de uma recusa. */
  canEditVerification: boolean;
};

async function replaceTeacherSubjects(teacherId: string, subjectIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('teacher_subjects')
    .delete()
    .eq('teacher_id', teacherId);
  if (deleteError) throw deleteError;
  if (subjectIds.length === 0) return;

  const { error } = await supabase
    .from('teacher_subjects')
    .insert(subjectIds.map((subjectId) => ({ teacher_id: teacherId, subject_id: subjectId })));
  if (error) throw error;
}

async function replaceTeacherLanguages(teacherId: string, languageIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('teacher_languages')
    .delete()
    .eq('teacher_id', teacherId);
  if (deleteError) throw deleteError;
  if (languageIds.length === 0) return;

  const { error } = await supabase
    .from('teacher_languages')
    .insert(languageIds.map((languageId) => ({ teacher_id: teacherId, language_id: languageId })));
  if (error) throw error;
}

/** Um link por professor: troca o conjunto salvo pelo link informado (ou só apaga). */
async function replaceSocialLink(teacherId: string, link: SocialLink | null): Promise<void> {
  const { error: deleteError } = await supabase
    .from('teacher_social_links')
    .delete()
    .eq('teacher_id', teacherId);
  if (deleteError) throw deleteError;

  const url = link ? normalizeSocialUrl(link.url) : '';
  if (!link || !url) return;

  const { error } = await supabase
    .from('teacher_social_links')
    .insert({ teacher_id: teacherId, network: link.network, url });
  if (error) throw error;
}

// Grava o cadastro profissional inteiro (perfil, matérias, idiomas, rede social e arquivos).
async function saveTeacherProfileData(
  params: SaveTeacherProfileParams,
  { canEditVerification }: SaveOptions,
): Promise<void> {
  const { teacherId } = params;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: params.fullName })
    .eq('id', teacherId);
  if (profileError) throw profileError;

  // CPF em teacher_verifications: só a coluna cpf é liberada, e só com status 'draft' ou 'rejected'.
  if (canEditVerification) {
    const { error: cpfError } = await supabase
      .from('teacher_verifications')
      .update({ cpf: onlyDigits(params.cpf) })
      .eq('teacher_id', teacherId);
    if (cpfError) throw cpfError;
  }

  const { error: teacherError } = await supabase
    .from('teachers')
    .update({
      bio: params.bio?.trim() ? params.bio.trim() : null,
      hourly_rate_cents: params.hourlyRateCents,
      tutoring_types: params.tutoringTypes,
      available_weekdays: params.weekdays,
      available_periods: params.periods,
      state: params.state,
      city_id: params.cityId,
      neighborhood: params.neighborhood.trim(),
    })
    .eq('id', teacherId);
  if (teacherError) throw teacherError;

  // Matérias e idiomas: substitui o conjunto (idempotente em reenvios).
  await replaceTeacherSubjects(teacherId, params.subjectIds);
  await replaceTeacherLanguages(teacherId, params.languageIds);

  if (params.socialLink !== undefined) {
    await replaceSocialLink(teacherId, params.socialLink);
  }

  if (params.avatar) {
    await uploadAvatar(teacherId, params.avatar);
  }

  // Documento de identidade: troca o anterior para não duplicar em reenvios.
  if (canEditVerification && params.identityDocument) {
    const { error } = await supabase
      .from('teacher_documents')
      .delete()
      .eq('teacher_id', teacherId)
      .eq('kind', 'identity');
    if (error) throw error;
    await uploadTeacherDocument(teacherId, 'identity', params.identityDocument);
  }

  for (const certificate of params.certificates ?? []) {
    await uploadTeacherDocument(teacherId, 'certificate', certificate);
  }
}

async function submitTeacherProfile(): Promise<VerificationStatus> {
  const { data, error } = await supabase.rpc('submit_teacher_profile');
  if (error) throw error;
  return data;
}

/**
 * Grava todo o cadastro profissional e envia para análise (submit_teacher_profile). No MVP a
 * verificação é simulada e aprova na hora, publicando o professor.
 */
export async function saveAndSubmitTeacherProfile(
  params: SaveTeacherProfileParams,
): Promise<VerificationStatus> {
  await saveTeacherProfileData(params, { canEditVerification: true });
  return submitTeacherProfile();
}

/**
 * Edição do perfil depois do onboarding (RF01, RF11). Se a verificação ainda não foi enviada ou foi
 * recusada, grava também CPF e documento e reenvia para análise; se já foi aprovada, só atualiza os
 * dados profissionais (o perfil continua publicado).
 */
export async function updateTeacherProfile(
  params: SaveTeacherProfileParams & { verificationStatus: VerificationStatus },
): Promise<VerificationStatus> {
  const canEditVerification = isVerificationEditable(params.verificationStatus);
  await saveTeacherProfileData(params, { canEditVerification });
  return canEditVerification ? submitTeacherProfile() : params.verificationStatus;
}

// Embed explícito: teachers e profiles também se ligam por favorite_teachers.
const MY_TEACHER_PROFILE_SELECT = `
  id, bio, hourly_rate_cents, tutoring_types, available_weekdays, available_periods,
  state, city_id,neighborhood, is_published, rating_average, rating_count,
  profiles!teachers_id_fkey ( full_name, avatar_url ),
  cities!teachers_city_fkey ( name ),
  teacher_subjects ( subjects ( id, name, sort_order ) ),
  teacher_languages ( languages ( id, name, sort_order ) ),
  teacher_social_links ( network, url ),
  teacher_verifications ( status, cpf ),
  teacher_documents ( kind, file_name, created_at )
`;

type NamedRow = { id: string; name: string; sort_order: number };

type MyTeacherProfileRow = {
  id: string;
  bio: string | null;
  hourly_rate_cents: number | null;
  tutoring_types: Enums<'tutoring_type'>[];
  available_weekdays: number[];
  available_periods: Enums<'day_period'>[];
  state: Enums<'brazilian_state'> | null;
  city_id: number | null;
  neighborhood: string | null;
  is_published: boolean;
  rating_average: number | null;
  rating_count: number;
  profiles: { full_name: string; avatar_url: string | null } | null;
  cities: { name: string } | null;
  teacher_subjects: { subjects: NamedRow | null }[];
  teacher_languages: { languages: NamedRow | null }[];
  teacher_social_links: SocialLink[];
  teacher_verifications: { status: VerificationStatus; cpf: string | null } | null;
  teacher_documents: {
    kind: Enums<'teacher_document_kind'>;
    file_name: string;
    created_at: string;
  }[];
};

function sortedNames(rows: (NamedRow | null)[]): { id: string; name: string }[] {
  return rows
    .filter((row): row is NamedRow => row !== null)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(({ id, name }) => ({ id, name }));
}

export function toMyTeacherProfile(row: MyTeacherProfileRow): MyTeacherProfile {
  const documents = [...row.teacher_documents].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  return {
    id: row.id,
    fullName: row.profiles?.full_name ?? '',
    avatarUrl: row.profiles?.avatar_url ?? null,
    bio: row.bio,
    hourlyRateCents: row.hourly_rate_cents,
    tutoringTypes: row.tutoring_types,
    weekdays: row.available_weekdays,
    periods: row.available_periods,
    state: row.state,
    cityId: row.city_id,
    neighborhood: row.neighborhood,
    cityName: row.cities?.name ?? null,
    isPublished: row.is_published,
    ratingAverage: row.rating_average === null ? null : Number(row.rating_average),
    ratingCount: row.rating_count,
    subjects: sortedNames(row.teacher_subjects.map((item) => item.subjects)),
    languages: sortedNames(row.teacher_languages.map((item) => item.languages)),
    socialLinks: row.teacher_social_links,
    verificationStatus: row.teacher_verifications?.status ?? 'draft',
    cpf: row.teacher_verifications?.cpf ?? null,
    identityDocumentName: documents.find((doc) => doc.kind === 'identity')?.file_name ?? null,
    certificateNames: documents
      .filter((doc) => doc.kind === 'certificate')
      .map((doc) => doc.file_name),
  };
}

/** Perfil profissional do próprio professor, com os dados privados (CPF, documentos, links). */
export async function getMyTeacherProfile(teacherId: string): Promise<MyTeacherProfile> {
  const { data, error } = await supabase
    .from('teachers')
    .select(MY_TEACHER_PROFILE_SELECT)
    .eq('id', teacherId)
    .single();

  if (error) throw error;
  return toMyTeacherProfile(data as unknown as MyTeacherProfileRow);
}
