import { extensionForContentType, type PickedFile } from '@/lib/file-picker';
import { uploadToBucket } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

import { withAvatarVersion } from './domain';
import type { AccountValues, Profile } from './types';

// Model/repositório do perfil: único lugar que fala com o Supabase. O banco só deixa o usuário
// alterar full_name e avatar_url em profiles e phone em contact_details (as linhas são criadas
// pelo trigger handle_new_user). Deixa o erro do Supabase subir; quem traduz é o hook.

const AVATARS_BUCKET = 'avatars';

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, avatar_url')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/** Celular do próprio usuário em E.164, ou null se ainda não informou. */
export async function getMyPhone(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('contact_details')
    .select('phone')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.phone ?? null;
}

/** Salva o nome (profiles) e o celular em E.164 (contact_details). */
export async function updateMyAccount(userId: string, values: AccountValues): Promise<void> {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: values.fullName })
    .eq('id', userId);
  if (profileError) throw profileError;

  const { error: phoneError } = await supabase
    .from('contact_details')
    .update({ phone: values.phone })
    .eq('user_id', userId);
  if (phoneError) throw phoneError;
}

/**
 * Troca a foto de perfil: envia para o bucket público avatars/<user_id>/avatar.<ext> (sobrescreve
 * a anterior) e grava a URL pública em profiles.avatar_url. Devolve a URL gravada.
 */
export async function uploadMyAvatar(userId: string, file: PickedFile): Promise<string> {
  const ext = extensionForContentType(file.contentType);
  const path = await uploadToBucket({
    bucket: AVATARS_BUCKET,
    path: `${userId}/avatar.${ext}`,
    base64: file.base64,
    contentType: file.contentType,
    upsert: true,
  });

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  const avatarUrl = withAvatarVersion(data.publicUrl, Date.now());

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);
  if (error) throw error;

  return avatarUrl;
}
