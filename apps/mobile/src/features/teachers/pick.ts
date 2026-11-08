import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import type { PickedFile } from './types';

// Escolha de arquivos para upload. O base64 é lido aqui para o helper de Storage enviar. Mantém a
// dependência dos pickers fora dos componentes de UI (apresentacionais) e das telas.

const DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/** Abre a galeria para escolher uma imagem (foto de perfil ou documento como imagem). */
export async function pickImage(): Promise<PickedFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    base64: true,
    quality: 0.7,
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset.base64) return null;

  return {
    uri: asset.uri,
    base64: asset.base64,
    fileName: asset.fileName ?? 'foto.jpg',
    contentType: asset.mimeType ?? 'image/jpeg',
  };
}

/**
 * Conteúdo do documento em base64, sem o prefixo data:. No web o expo-file-system não existe: o
 * próprio seletor lê o arquivo (opção base64) e devolve um data URL.
 */
async function readDocumentBase64(
  asset: DocumentPicker.DocumentPickerAsset,
): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (!asset.base64) return null;
    return asset.base64.slice(asset.base64.indexOf(',') + 1);
  }
  return FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
}

/** Abre o seletor de documentos (PDF, JPG ou PNG) e lê o conteúdo em base64. */
export async function pickDocument(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: DOCUMENT_TYPES,
    copyToCacheDirectory: true,
    base64: true,
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  const base64 = await readDocumentBase64(asset);
  if (!base64) return null;

  return {
    uri: asset.uri,
    base64,
    fileName: asset.name,
    contentType: asset.mimeType ?? 'application/pdf',
  };
}
