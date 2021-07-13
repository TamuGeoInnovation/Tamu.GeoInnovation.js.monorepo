import { TokenSet } from 'openid-client';

export class AuthUtils {
  public static updateTokenSet(request: any, tokenSet: TokenSet) {
    request.user.access_token = tokenSet.access_token;
    request.user.expires_at = tokenSet.expires_at;
    request.user.id_token = tokenSet.id_token;
    request.user.refresh_token = tokenSet.refresh_token;
    request.user.scope = tokenSet.scope;
    request.user.token_type = tokenSet.token_type;

    return request;
  }
}
