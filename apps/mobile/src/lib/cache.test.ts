import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system/legacy';

import { queryClient } from '@/lib/query-client';

import { CACHE_LIMIT_BYTES, clearAppCache, formatBytes, getCacheSizeBytes } from './cache';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiRemove: jest.fn(),
  },
}));

jest.mock('expo-image', () => ({
  Image: {
    clearMemoryCache: jest.fn(),
    clearDiskCache: jest.fn(),
  },
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: '/cache',
  getInfoAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
}));

jest.mock('@/lib/query-client', () => ({
  queryClient: { removeQueries: jest.fn() },
}));

const mockStorage = AsyncStorage as unknown as {
  getAllKeys: jest.Mock;
  multiGet: jest.Mock;
  multiRemove: jest.Mock;
};
const mockImage = Image as unknown as {
  clearMemoryCache: jest.Mock;
  clearDiskCache: jest.Mock;
};
const mockFileSystem = FileSystem as unknown as {
  getInfoAsync: jest.Mock;
  readDirectoryAsync: jest.Mock;
  deleteAsync: jest.Mock;
  makeDirectoryAsync: jest.Mock;
};
const mockQueryClient = queryClient as unknown as { removeQueries: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();
  mockStorage.getAllKeys.mockResolvedValue([]);
  mockStorage.multiGet.mockResolvedValue([]);
  mockStorage.multiRemove.mockResolvedValue(undefined);
  mockImage.clearMemoryCache.mockResolvedValue(true);
  mockImage.clearDiskCache.mockResolvedValue(true);
  mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false });
  mockFileSystem.readDirectoryAsync.mockResolvedValue([]);
  mockFileSystem.deleteAsync.mockResolvedValue(undefined);
  mockFileSystem.makeDirectoryAsync.mockResolvedValue(undefined);
});

describe('formatBytes', () => {
  it('formata bytes, KB e MB', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1,5 KB');
    expect(formatBytes(CACHE_LIMIT_BYTES)).toBe('200 MB');
  });
});

describe('getCacheSizeBytes', () => {
  it('soma o AsyncStorage sem a sessão e o diretório de cache no celular', async () => {
    mockStorage.getAllKeys.mockResolvedValue(['sb-123-auth-token', 'cache']);
    mockStorage.multiGet.mockResolvedValue([['cache', '1234']]);
    mockFileSystem.getInfoAsync.mockImplementation((uri: string) =>
      Promise.resolve(
        uri === '/cache'
          ? { exists: true, isDirectory: true, size: 0 }
          : { exists: true, isDirectory: false, size: 100 },
      ),
    );
    mockFileSystem.readDirectoryAsync.mockResolvedValue(['a.txt']);

    await expect(getCacheSizeBytes('ios')).resolves.toBe(104);
    expect(mockStorage.multiGet).toHaveBeenCalledWith(['cache']);
    expect(mockFileSystem.deleteAsync).not.toHaveBeenCalled();
  });

  it('no web conta só o AsyncStorage sem a sessão', async () => {
    mockStorage.getAllKeys.mockResolvedValue(['sb-123-auth-token', 'cache']);
    mockStorage.multiGet.mockResolvedValue([['cache', '1234']]);

    await expect(getCacheSizeBytes('web')).resolves.toBe(4);
    expect(mockFileSystem.getInfoAsync).not.toHaveBeenCalled();
  });

  it('propaga o erro da leitura do cache', async () => {
    mockStorage.getAllKeys.mockRejectedValue(new Error('boom'));

    await expect(getCacheSizeBytes('web')).rejects.toThrow('boom');
  });
});

describe('clearAppCache', () => {
  it('preserva a sessão do Supabase e limpa o resto no celular', async () => {
    mockStorage.getAllKeys.mockResolvedValue(['sb-123-auth-token', 'cache']);

    await clearAppCache('ios');

    expect(mockStorage.multiRemove).toHaveBeenCalledWith(['cache']);
    expect(mockImage.clearMemoryCache).toHaveBeenCalled();
    expect(mockImage.clearDiskCache).toHaveBeenCalled();
    expect(mockFileSystem.deleteAsync).toHaveBeenCalledWith('/cache', { idempotent: true });
    expect(mockFileSystem.makeDirectoryAsync).toHaveBeenCalledWith('/cache', {
      intermediates: true,
    });
    expect(mockQueryClient.removeQueries).toHaveBeenCalled();
  });

  it('não mexe no diretório de cache no web', async () => {
    mockStorage.getAllKeys.mockResolvedValue(['sb-123-auth-token', 'cache']);

    await clearAppCache('web');

    expect(mockStorage.multiRemove).toHaveBeenCalledWith(['cache']);
    expect(mockFileSystem.deleteAsync).not.toHaveBeenCalled();
    expect(mockQueryClient.removeQueries).toHaveBeenCalled();
  });

  it('mantém o perfil e a query do tamanho na limpeza', async () => {
    mockStorage.getAllKeys.mockResolvedValue([]);

    await clearAppCache('web');

    const call = mockQueryClient.removeQueries.mock.calls[0][0] as {
      predicate: (query: { queryKey: unknown[] }) => boolean;
    };

    expect(call.predicate({ queryKey: ['profiles', 'user-1'] })).toBe(false);
    expect(call.predicate({ queryKey: ['settings', 'cache-size'] })).toBe(false);
    expect(call.predicate({ queryKey: ['contact-requests'] })).toBe(true);
  });
});
