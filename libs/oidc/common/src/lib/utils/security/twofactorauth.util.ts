import * as otplib from 'otplib';
import * as crypto from 'crypto';

export class TwoFactorAuthUtils {
  public static build() {
    // Set time limit to 5 minutes
    otplib.totp.options = { step: 300 };
  }

  public static isValid(token: string, secret: string, method: TwoFactorAuthMethod) {
    let ret = false;
    if (token) {
      if (token.length === 6) {
        otplib[method].options = { crypto };
        ret = otplib[method].check(token, secret);
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

type TwoFactorAuthMethod = 'authenticator' | 'totp';
class TwoFactorAuthError extends Error {
  constructor(message: string) {
    super(message);
  }
}
