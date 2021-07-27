import { Request } from 'express';
import { TokenSet } from 'openid-client';

export class AuthUtils {
  public static updateTokenSet(request: UserRequest, tokenSet: TokenSet) {
    request.user.access_token = tokenSet.access_token;
    request.user.expires_at = tokenSet.expires_at;
    request.user.id_token = tokenSet.id_token;
    request.user.refresh_token = tokenSet.refresh_token;
    request.user.scope = tokenSet.scope;
    request.user.token_type = tokenSet.token_type;

    return request;
  }
}

export interface UserRequest extends Request {
  user: {
    access_token: string;
    expires_at: number;
    id_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
  };
}
