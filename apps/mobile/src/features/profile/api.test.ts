import { uploadToBucket } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

import { getMyPhone, getProfile, updateMyAccount, uploadMyAvatar } from './api';

// Camada de dados: testamos mockando a única porta do Supabase (@/lib/supabase) e o envio ao
// Storage (@/lib/storage).
jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(), storage: { from: jest.fn() } },
}));
jest.mock('@/lib/storage', () => ({ uploadToBucket: jest.fn() }));

const mockFrom = supabase.from as jest.Mock;
const mockStorageFrom = supabase.storage.from as jest.Mock;
const mockUpload = uploadToBucket as jest.MockedFunction<typeof uploadToBucket>;

type Result = { data?: unknown; error: unknown };

// Cadeia do PostgREST: select/update/eq devolvem a cadeia; o fim (single, maybeSingle ou o
// próprio eq de um update) resolve com o resultado.
function mockTable(result: Result) {
  const chain = {
    select: jest.fn(),
    update: jest.fn(),
    eq: jest.fn(),
    single: jest.fn().mockResolvedValue(result),
    maybeSingle: jest.fn().mockResolvedValue(result),
    then: (resolve: (value: Result) => unknown) => Promise.resolve(result).then(resolve),
  };
  chain.select.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  return chain;
}

afterEach(() => jest.clearAllMocks());

describe('getProfile', () => {
  it('lê o perfil do usuário', async () => {
    const profile = { id: 'u1', role: 'guardian', full_name: 'Juliana', avatar_url: null };
    const chain = mockTable({ data: profile, error: null });
    mockFrom.mockReturnValue(chain);

    await expect(getProfile('u1')).resolves.toEqual(profile);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(chain.eq).toHaveBeenCalledWith('id', 'u1');
  });

  it('propaga o erro do Supabase', async () => {
    const error = new Error('falha');
    mockFrom.mockReturnValue(mockTable({ data: null, error }));

    await expect(getProfile('u1')).rejects.toBe(error);
  });
});

describe('getMyPhone', () => {
  it('lê o celular em contact_details', async () => {
    const chain = mockTable({ data: { phone: '+5511999991234' }, error: null });
    mockFrom.mockReturnValue(chain);

    await expect(getMyPhone('u1')).resolves.toBe('+5511999991234');
    expect(mockFrom).toHaveBeenCalledWith('contact_details');
    expect(chain.select).toHaveBeenCalledWith('phone');
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'u1');
  });

  it('sem linha ou sem número, devolve null', async () => {
    mockFrom.mockReturnValue(mockTable({ data: null, error: null }));
    await expect(getMyPhone('u1')).resolves.toBeNull();

    mockFrom.mockReturnValue(mockTable({ data: { phone: null }, error: null }));
    await expect(getMyPhone('u1')).resolves.toBeNull();
  });

  it('propaga o erro do Supabase', async () => {
    const error = new Error('falha');
    mockFrom.mockReturnValue(mockTable({ data: null, error }));

    await expect(getMyPhone('u1')).rejects.toBe(error);
  });
});

describe('updateMyAccount', () => {
  it('grava o nome em profiles e o celular em contact_details', async () => {
    const profiles = mockTable({ error: null });
    const contacts = mockTable({ error: null });
    mockFrom.mockImplementation((table: string) =>
      table === 'profiles' ? profiles : table === 'contact_details' ? contacts : null,
    );

    await updateMyAccount('u1', { fullName: 'Juliana Martins', phone: '+5511999991234' });

    expect(profiles.update).toHaveBeenCalledWith({ full_name: 'Juliana Martins' });
    expect(profiles.eq).toHaveBeenCalledWith('id', 'u1');
    expect(contacts.update).toHaveBeenCalledWith({ phone: '+5511999991234' });
    expect(contacts.eq).toHaveBeenCalledWith('user_id', 'u1');
  });

  it('para no primeiro erro (nome)', async () => {
    const error = new Error('falha');
    const contacts = mockTable({ error: null });
    mockFrom.mockImplementation((table: string) =>
      table === 'profiles' ? mockTable({ error }) : contacts,
    );

    await expect(
      updateMyAccount('u1', { fullName: 'Juliana', phone: '+5511999991234' }),
    ).rejects.toBe(error);
    expect(contacts.update).not.toHaveBeenCalled();
  });

  it('propaga o erro do celular', async () => {
    const error = { code: '23514', message: 'check' };
    mockFrom.mockImplementation((table: string) =>
      table === 'profiles' ? mockTable({ error: null }) : mockTable({ error }),
    );

    await expect(
      updateMyAccount('u1', { fullName: 'Juliana', phone: '+5511999991234' }),
    ).rejects.toBe(error);
  });
});

describe('uploadMyAvatar', () => {
  const FILE = {
    uri: 'file:///foto.png',
    base64: 'aGVsbG8=',
    fileName: 'foto.png',
    contentType: 'image/png',
  };

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
  });
  afterEach(() => jest.restoreAllMocks());

  it('envia para avatars/<user_id>/ e grava a URL pública versionada no perfil', async () => {
    mockUpload.mockResolvedValue('u1/avatar.png');
    const getPublicUrl = jest
      .fn()
      .mockReturnValue({ data: { publicUrl: 'https://x.supabase.co/avatars/u1/avatar.png' } });
    mockStorageFrom.mockReturnValue({ getPublicUrl });
    const profiles = mockTable({ error: null });
    mockFrom.mockReturnValue(profiles);

    const url = await uploadMyAvatar('u1', FILE);

    expect(mockUpload).toHaveBeenCalledWith({
      bucket: 'avatars',
      path: 'u1/avatar.png',
      base64: 'aGVsbG8=',
      contentType: 'image/png',
      upsert: true,
    });
    expect(mockStorageFrom).toHaveBeenCalledWith('avatars');
    expect(getPublicUrl).toHaveBeenCalledWith('u1/avatar.png');
    expect(url).toBe('https://x.supabase.co/avatars/u1/avatar.png?v=1700000000000');
    expect(profiles.update).toHaveBeenCalledWith({ avatar_url: url });
    expect(profiles.eq).toHaveBeenCalledWith('id', 'u1');
  });

  it('propaga o erro do Storage sem mexer no perfil', async () => {
    const error = { statusCode: '413', message: 'Payload too large' };
    mockUpload.mockRejectedValue(error);

    await expect(uploadMyAvatar('u1', FILE)).rejects.toBe(error);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('propaga o erro ao gravar a URL', async () => {
    const error = new Error('falha');
    mockUpload.mockResolvedValue('u1/avatar.png');
    mockStorageFrom.mockReturnValue({
      getPublicUrl: () => ({ data: { publicUrl: 'https://x/avatar.png' } }),
    });
    mockFrom.mockReturnValue(mockTable({ error }));

    await expect(uploadMyAvatar('u1', FILE)).rejects.toBe(error);
  });
});
