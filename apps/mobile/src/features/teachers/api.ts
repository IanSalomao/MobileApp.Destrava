import type { Enums } from '@/lib/database.types';
import { onlyDigits } from '@/lib/masks';
import { uploadToBucket } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

import { extensionForContentType, type PickedFile } from './types';

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
  city: string;
  state: string;
  subjectIds: string[];
  languageIds: string[];
  bio?: string;
  tutoringTypes: Enums<'tutoring_type'>[];
  hourlyRateCents: number;
  weekdays: number[];
  periods: Enums<'day_period'>[];
  avatar?: PickedFile | null;
  identityDocument?: PickedFile | null;
  certificates?: PickedFile[];
};

/**
 * Grava todo o cadastro profissional e envia para análise (submit_teacher_profile). No MVP a
 * verificação é simulada e aprova na hora, publicando o professor.
 */
export async function saveAndSubmitTeacherProfile(
  params: SaveTeacherProfileParams,
): Promise<Enums<'verification_status'>> {
  const { teacherId } = params;

  // Nome (profiles) e CPF (teacher_verifications: só a coluna cpf é liberada; status 'draft' permite).
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: params.fullName })
    .eq('id', teacherId);
  if (profileError) throw profileError;

  const { error: cpfError } = await supabase
    .from('teacher_verifications')
    .update({ cpf: onlyDigits(params.cpf) })
    .eq('teacher_id', teacherId);
  if (cpfError) throw cpfError;

  // Dados do perfil profissional.
  const { error: teacherError } = await supabase
    .from('teachers')
    .update({
      bio: params.bio?.trim() ? params.bio.trim() : null,
      hourly_rate_cents: params.hourlyRateCents,
      tutoring_types: params.tutoringTypes,
      available_weekdays: params.weekdays,
      available_periods: params.periods,
      city: params.city.trim(),
      state: params.state.trim().toUpperCase(),
    })
    .eq('id', teacherId);
  if (teacherError) throw teacherError;

  // Matérias e idiomas: substitui o conjunto (idempotente em reenvios).
  const { error: deleteSubjectsError } = await supabase
    .from('teacher_subjects')
    .delete()
    .eq('teacher_id', teacherId);
  if (deleteSubjectsError) throw deleteSubjectsError;
  if (params.subjectIds.length > 0) {
    const { error } = await supabase
      .from('teacher_subjects')
      .insert(
        params.subjectIds.map((subjectId) => ({ teacher_id: teacherId, subject_id: subjectId })),
      );
    if (error) throw error;
  }

  const { error: deleteLanguagesError } = await supabase
    .from('teacher_languages')
    .delete()
    .eq('teacher_id', teacherId);
  if (deleteLanguagesError) throw deleteLanguagesError;
  if (params.languageIds.length > 0) {
    const { error } = await supabase.from('teacher_languages').insert(
      params.languageIds.map((languageId) => ({
        teacher_id: teacherId,
        language_id: languageId,
      })),
    );
    if (error) throw error;
  }

  if (params.avatar) {
    await uploadAvatar(teacherId, params.avatar);
  }

  // Documento de identidade (obrigatório): troca o anterior para não duplicar em reenvios.
  if (params.identityDocument) {
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

  const { data, error } = await supabase.rpc('submit_teacher_profile');
  if (error) throw error;
  return data;
}
