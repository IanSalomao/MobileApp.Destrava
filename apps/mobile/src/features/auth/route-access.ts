import type { UserRole } from '@/features/profile/types';

// AUT-05: regra pura de acesso por papel. Sem React e sem Expo, para ser testada direto.
// - guest: telas de cadastro e login, só para quem está deslogado.
// - guardian / teacher: áreas exclusivas de cada papel.
// As abas e o onboarding exigem só estar logado (RF03) e usam `isSignedIn` direto no layout raiz.
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

/**
 * Destino de quem tenta abrir uma área barrada: as abas, se está logado; a escolha de perfil
 * (primeira tela do app, RF03), se não está. Vai explícito no `redirectTo` de cada guarda porque,
 * sem ele, o Expo Router manda para a URL do grupo `/(auth)`, que não tem index ("Unmatched Route").
 */
export function homeHref({ isSignedIn }: AccessState): '/' | '/welcome' {
  return isSignedIn ? '/' : '/welcome';
}
