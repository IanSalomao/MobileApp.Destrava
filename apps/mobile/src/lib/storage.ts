import { decode } from 'base64-arraybuffer';

import { supabase } from './supabase';

// Envio de arquivos ao Storage. O supabase-js no React Native não aceita Blob de file://; o caminho
// confiável é decodificar o base64 do arquivo para ArrayBuffer e enviar isso.

export type UploadParams = {
  bucket: string;
  /** Caminho dentro do bucket, sempre começando pela pasta do usuário (<user_id>/...). */
  path: string;
  /** Conteúdo do arquivo em base64 (sem o prefixo data:). */
  base64: string;
  contentType: string;
  /** Sobrescreve um arquivo já existente no mesmo caminho. */
  upsert?: boolean;
};

/** Envia um arquivo e devolve o caminho salvo (storage_path). Lança o erro do Supabase. */
export async function uploadToBucket({
  bucket,
  path,
  base64,
  contentType,
  upsert = true,
}: UploadParams): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, decode(base64), { contentType, upsert });

  if (error) throw error;
  return data.path;
}
