import { canAccess, homeHref, type AccessState, type RouteArea } from '../route-access';

const visitor: AccessState = { isSignedIn: false, role: undefined };
const guardian: AccessState = { isSignedIn: true, role: 'guardian' };
const teacher: AccessState = { isSignedIn: true, role: 'teacher' };
const noRole: AccessState = { isSignedIn: true, role: null };

describe('AUT-05: canAccess (guarda de rotas por papel)', () => {
  it.each<[string, AccessState, RouteArea, boolean]>([
    ['visitante abre login e cadastro', visitor, 'guest', true],
    ['responsável logado não abre login e cadastro', guardian, 'guest', false],
    ['professor logado não abre login e cadastro', teacher, 'guest', false],
    ['responsável abre a área de responsável', guardian, 'guardian', true],
    ['professor é barrado na área de responsável', teacher, 'guardian', false],
    ['professor abre a área de professor', teacher, 'teacher', true],
    ['responsável é barrado na área de professor', guardian, 'teacher', false],
    ['visitante é barrado na área de responsável', visitor, 'guardian', false],
    ['visitante é barrado na área de professor', visitor, 'teacher', false],
    ['logado sem papel é barrado na área de responsável', noRole, 'guardian', false],
    ['logado sem papel é barrado na área de professor', noRole, 'teacher', false],
  ])('%s', (_label, state, area, expected) => {
    expect(canAccess(area, state)).toBe(expected);
  });

  it('nega enquanto o papel ainda não carregou', () => {
    const loading: AccessState = { isSignedIn: true, role: undefined };

    expect(canAccess('guardian', loading)).toBe(false);
    expect(canAccess('teacher', loading)).toBe(false);
  });
});

describe('RF03: homeHref (destino de quem é barrado)', () => {
  it.each<[string, AccessState, string]>([
    ['visitante vai para a escolha de perfil', visitor, '/welcome'],
    ['responsável vai para o início da área do responsável', guardian, '/'],
    ['professor vai para o início da área do professor', teacher, '/dashboard'],
    ['logado sem papel (Google, RNF06) vai para a escolha de papel', noRole, '/choose-role'],
  ])('%s', (_label, state, expected) => {
    expect(homeHref(state)).toBe(expected);
  });
});
