import { sign, decode, Secret } from 'jsonwebtoken';

export class JwtUtil {
  public static generateLogoutToken(id_token_hint: string) {
    const decoded: IDecoded = decode(id_token_hint);

    const logoutTokenUncrypted = {
      iss: decoded.iss,
      sub: decoded.sub,
      aud: decoded.aud,
      iat: decoded.iat,
      jti: '',
      events: {
        'http://schemas.openid.net/event/backchannel-logout': {}
      },
      sid: decoded.sid
    };
    //TODO: Change passphrase
    const key: Secret = {
      key: 'k',
      passphrase: 'paincakes'
    };
    const logoutJWS = sign(logoutTokenUncrypted, key, {
      algorithm: 'RS256'
    });
    return logoutJWS;
  }
}

interface IDecoded {
  iss: string;
  sub: string;
  aud: string;
  iat: string;
  jti: string;
  events: {};
  sid: string;
}
