import { sign, decode, Secret } from 'jsonwebtoken';

// TODO: Can remove this - Aaron H (5/12/22)
export class JwtUtil {
  public static generateLogoutToken(id_token_hint: string, passphrase: string) {
    const decoded: IDecoded = decode(id_token_hint) as any;

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

    const key: Secret = {
      key: 'k',
      passphrase: passphrase
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
  events: ValidObject;
  sid: string;
}

export interface ValidObject {
  [key: string]: boolean | string | number | ValidObject;
}
