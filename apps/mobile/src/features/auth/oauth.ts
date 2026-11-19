// Retorno do login com Google (RNF06). Domínio puro: lê a URL de volta do navegador.
// Fluxo implícito: os tokens vêm no fragmento (#access_token=...&refresh_token=...). Fluxo PKCE: vem
// ?code=... na query. Em caso de erro, o provedor manda error/error_description.

export type OAuthCallback =
  | { type: 'tokens'; accessToken: string; refreshToken: string }
  | { type: 'code'; code: string }
  | { type: 'error'; message: string };

function paramsOf(url: string): URLSearchParams {
  const params = new URLSearchParams();
  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash.includes('?') ? beforeHash.slice(beforeHash.indexOf('?') + 1) : '';
  for (const part of [query, hash]) {
    new URLSearchParams(part).forEach((value, key) => params.set(key, value));
  }
  return params;
}

export function parseOAuthCallback(url: string): OAuthCallback {
  const params = paramsOf(url);

  const error = params.get('error_description') ?? params.get('error');
  if (error) return { type: 'error', message: error };

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) return { type: 'tokens', accessToken, refreshToken };

  const code = params.get('code');
  if (code) return { type: 'code', code };

  return { type: 'error', message: 'missing_tokens' };
}
