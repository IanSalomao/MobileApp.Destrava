import { parseOAuthCallback } from './oauth';

describe('parseOAuthCallback', () => {
  it('lê os tokens do fragmento (fluxo implícito)', () => {
    expect(
      parseOAuthCallback(
        'exp://192.168.0.10:8081/--/#access_token=abc&expires_in=3600&refresh_token=def&token_type=bearer',
      ),
    ).toEqual({ type: 'tokens', accessToken: 'abc', refreshToken: 'def' });
  });

  it('lê o code da query (fluxo PKCE)', () => {
    expect(parseOAuthCallback('destrava://?code=xyz')).toEqual({ type: 'code', code: 'xyz' });
  });

  it('devolve o erro do provedor', () => {
    expect(
      parseOAuthCallback('destrava://?error=access_denied&error_description=Usuario+cancelou'),
    ).toEqual({ type: 'error', message: 'Usuario cancelou' });
    expect(parseOAuthCallback('destrava://#error=server_error')).toEqual({
      type: 'error',
      message: 'server_error',
    });
  });

  it('sem tokens nem code é erro', () => {
    expect(parseOAuthCallback('destrava://')).toEqual({ type: 'error', message: 'missing_tokens' });
  });
});
