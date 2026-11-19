import { supabase } from '@/lib/supabase';

import { createContactRequest } from './api';
import type { ContactRequestPayload } from './domain';

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const mockFrom = supabase.from as jest.Mock;

const PAYLOAD: ContactRequestPayload = {
  teacher_id: 'teacher-1',
  student_id: 'student-1',
  guardian_name: 'Juliana Martins',
  student_name: 'Lucas Martins',
  student_school_grade: 'elementary_7',
  student_age: 12,
  reason: 'Reforço em frações.',
  preferred_tutoring_type: 'online',
};

function insertBuilder(data: unknown, error: unknown = null) {
  const single = jest.fn().mockResolvedValue({ data, error });
  const select = jest.fn().mockReturnValue({ single });
  const insert = jest.fn().mockReturnValue({ select });
  return { insert, select, single };
}

describe('createContactRequest', () => {
  afterEach(() => jest.clearAllMocks());

  it('grava em contact_requests e devolve o id da solicitação', async () => {
    const builder = insertBuilder({ id: 'request-1' });
    mockFrom.mockReturnValue(builder);

    await expect(createContactRequest(PAYLOAD)).resolves.toEqual({ id: 'request-1' });

    expect(mockFrom).toHaveBeenCalledWith('contact_requests');
    expect(builder.insert).toHaveBeenCalledWith(PAYLOAD);
    expect(builder.select).toHaveBeenCalledWith('id');
  });

  it('deixa o erro do Supabase subir para o hook traduzir', async () => {
    const error = { code: '23505', message: 'duplicate key value' };
    mockFrom.mockReturnValue(insertBuilder(null, error));

    await expect(createContactRequest(PAYLOAD)).rejects.toBe(error);
  });
});
