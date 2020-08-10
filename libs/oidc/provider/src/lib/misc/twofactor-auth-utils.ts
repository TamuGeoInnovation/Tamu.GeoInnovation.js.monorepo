import { authenticator } from 'otplib';
import * as crypto from 'crypto';

export class TwoFactorAuthUtils {
  // TODO: AT THE MOMENT THE KEY / SECRET IS HARDCODED INTO THE EJS FILE (2fa-scan.ejs), THIS IS NO BUENO
  // FIXED: atharmon (4/3/19)
  public static isValid(token: string, secret: string): boolean {
    let ret = false;
    if (token) {
      if (token.length === 6) {
        authenticator.options = { crypto };
        ret = authenticator.check(token, secret);
      } else {
        throw new TwoFactorAuthError('Invalid input token');
      }
    } else {
      throw new TwoFactorAuthError('Input token cannot be null or undefined');
    }
    return ret;
  }

  public static generateNewSecret(): Promise<string> {
    authenticator.options = { crypto };
    return new Promise((resolve, reject) => {
      const secret = authenticator.generateSecret();
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
