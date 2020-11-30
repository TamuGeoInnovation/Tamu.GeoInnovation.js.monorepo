import * as otplib from 'otplib';
import * as crypto from 'crypto';

export class TwoFactorAuthUtils {
  static isValid(token: string, secret: string): boolean {
    let ret = false;
    if (token) {
      if (token.length == 6) {
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

  static generateNewSecret(): Promise<string> {
    otplib.authenticator.options = { crypto };
    return new Promise((resolve, reject) => {
      const secret = otplib.authenticator.generateSecret();
      if (secret) {
        resolve(secret);
      } else {
        reject();
      }
    });
  }
}

class TwoFactorAuthError extends Error {
  constructor(message: string) {
    super(message);
  }
}
