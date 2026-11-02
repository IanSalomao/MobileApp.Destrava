import type { UserRole } from '@/features/profile/types';

// AUT-05: regra pura de acesso por papel. Sem React e sem Expo, para ser testada direto.
// - guest: telas de login/cadastro, só para quem está deslogado.
// - guardian / teacher: áreas exclusivas de cada papel.
// As abas públicas (RF03) não passam por aqui: qualquer visitante as vê.
export type RouteArea = 'guest' | 'guardian' | 'teacher';

export type AccessState = {
  isSignedIn: boolean;
  /** Papel do perfil (tabela profiles). Ausente enquanto não carregou ou se o perfil não tem papel. */
  role: UserRole | null | undefined;
};

export function canAccess(area: RouteArea, { isSignedIn, role }: AccessState): boolean {
  if (area === 'guest') return !isSignedIn;
  // Logado sem papel conhecido não entra em área nenhuma: nega por padrão.
  return isSignedIn && role === area;
}
