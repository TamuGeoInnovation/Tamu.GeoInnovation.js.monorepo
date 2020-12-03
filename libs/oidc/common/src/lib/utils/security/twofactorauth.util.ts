import * as otplib from 'otplib';
import * as crypto from 'crypto';

export class TwoFactorAuthUtils {
  public static isValid(token: string, secret: string) {
    let ret = false;
    if (token) {
      if (token.length === 6) {
        otplib.authenticator.options = { crypto };
        ret = otplib.authenticator.check(token, secret);
      } else {
        throw new TwoFactorAuthError('Invalid input token');
      }
    } else {
      throw new TwoFactorAuthError('Input token cannot be null or undefined');
    }

    return ret;
  }

  public static generateNewSecret() {
    otplib.authenticator.options = { crypto };
    const secret = otplib.authenticator.generateSecret();

    return secret;
  }
}

class TwoFactorAuthError extends Error {
  constructor(message: string) {
    super(message);
  }
}
