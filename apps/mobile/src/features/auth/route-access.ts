import type { UserRole } from '@/features/profile/types';

// AUT-05: regra pura de acesso por papel. Sem React e sem Expo, para ser testada direto.
// - guest: telas de cadastro e login, só para quem está deslogado.
// - guardian / teacher: áreas exclusivas de cada papel (abas e telas de cada um).
// O onboarding e as telas comuns aos dois papéis exigem só estar logado (RF03) e usam `isSignedIn`
// direto no layout raiz.
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

/** Início de cada papel: a primeira aba da área do responsável e a da área do professor. */
export const GUARDIAN_HOME = '/';
export const TEACHER_HOME = '/dashboard';

export type HomeHref = '/welcome' | typeof GUARDIAN_HOME | typeof TEACHER_HOME;

/**
 * Destino de quem tenta abrir uma área barrada e de quem acabou de entrar ou sair:
 * - deslogado: a escolha de perfil (primeira tela do app, RF03);
 * - responsável e professor: o início da própria área;
 * - logado sem papel conhecido (o perfil não carregou): a primeira tela. Na prática o layout raiz
 *   nem monta as rotas nesse caso; mostra o aviso de conta indisponível (veja hasKnownRole).
 * Vai explícito no `redirectTo` de cada guarda porque, sem ele, o Expo Router manda para a URL do
 * grupo (ex.: `/(auth)`), que não tem index ("Unmatched Route").
 */
export function homeHref({ isSignedIn, role }: AccessState): HomeHref {
  if (!isSignedIn) return '/welcome';
  if (role === 'guardian') return GUARDIAN_HOME;
  if (role === 'teacher') return TEACHER_HOME;
  return '/welcome';
}

/**
 * Todo cadastro tem papel (o formulário exige e o banco grava). Logado sem papel conhecido só
 * acontece se o perfil não carregou: o layout raiz mostra um aviso com "Tentar de novo" e "Sair".
 */
export function hasKnownRole({ isSignedIn, role }: AccessState): boolean {
  return !isSignedIn || role === 'guardian' || role === 'teacher';
}
