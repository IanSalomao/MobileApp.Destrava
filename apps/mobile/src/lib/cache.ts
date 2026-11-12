import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import { queryClient } from './query-client';

// RNF10: limite de 200 MB para o cache local, com opção de limpeza.
// Decisão do MVP: o limite é exibido e a limpeza é manual em Configurações. Não apagamos o
// cache automaticamente para não remover dados sem uma ação do usuário.
export const CACHE_LIMIT_BYTES = 200 * 1024 * 1024;

// A sessão do Supabase fica no AsyncStorage (chave "sb-...-auth-token", inclusive no
// LargeSecureStore do celular). Ela nunca entra na limpeza, senão o usuário é deslogado.
const AUTH_STORAGE_PREFIX = 'sb-';

function isAuthStorageKey(key: string): boolean {
  return key.startsWith(AUTH_STORAGE_PREFIX);
}

async function getAsyncStorageCacheBytes(): Promise<number> {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((key) => !isAuthStorageKey(key));
  if (cacheKeys.length === 0) return 0;

  const entries = await AsyncStorage.multiGet(cacheKeys);
  return entries.reduce((total, [, value]) => total + (value?.length ?? 0), 0);
}

async function getDirectorySize(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) return 0;
  if (!info.isDirectory) return info.size ?? 0;

  const entries = await FileSystem.readDirectoryAsync(uri);
  const sizes = await Promise.all(
    entries.map((entry) => getDirectorySize(`${uri}${uri.endsWith('/') ? '' : '/'}${entry}`)),
  );

  return sizes.reduce((total, size) => total + size, 0);
}

/** Tamanho aproximado do cache local (diretório de cache + AsyncStorage sem a sessão). */
export async function getCacheSizeBytes(platform: string = Platform.OS): Promise<number> {
  let total = await getAsyncStorageCacheBytes();
  const cacheDirectory = FileSystem.cacheDirectory;

  if (platform !== 'web' && cacheDirectory) {
    total += await getDirectorySize(cacheDirectory);
  }

  return total;
}

/**
 * Limpa o cache local sem encerrar a sessão: preserva as chaves do Supabase, limpa o cache de
 * consultas, o cache de imagens e o diretório temporário do app.
 */
export async function clearAppCache(platform: string = Platform.OS): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((key) => !isAuthStorageKey(key));
  if (cacheKeys.length > 0) await AsyncStorage.multiRemove(cacheKeys);

  await Promise.all([Image.clearMemoryCache(), Image.clearDiskCache()]);

  const cacheDirectory = FileSystem.cacheDirectory;
  if (platform !== 'web' && cacheDirectory) {
    await FileSystem.deleteAsync(cacheDirectory, { idempotent: true });
    await FileSystem.makeDirectoryAsync(cacheDirectory, { intermediates: true });
  }

  // O perfil é usado pela guarda de rotas; a query do próprio tamanho é invalidada pelo hook.
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== 'profiles' && query.queryKey[0] !== 'settings',
  });
}

/** Formata bytes para exibição ("0 B", "1,5 KB", "200 MB"). */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = Math.max(0, bytes);
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',');

  return `${formatted} ${units[unitIndex]}`;
}
