import { parseRoleParam } from './schemas';

describe('parseRoleParam', () => {
  it('aceita os perfis válidos', () => {
    expect(parseRoleParam('guardian')).toBe('guardian');
    expect(parseRoleParam('teacher')).toBe('teacher');
  });

  it('ignora valores ausentes ou inválidos', () => {
    expect(parseRoleParam(undefined)).toBeUndefined();
    expect(parseRoleParam('admin')).toBeUndefined();
    expect(parseRoleParam(['teacher'])).toBeUndefined();
  });
});
