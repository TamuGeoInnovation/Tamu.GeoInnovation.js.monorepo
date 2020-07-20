import { Injectable, NestMiddleware } from '@nestjs/common';
import { urlFragment, urlHas } from '../../_utils/url-utils';
import { UserRepo, SecretQuestionRepo } from '../../entities/all.entity';

export class PasswordValidationMiddleware implements NestMiddleware {
  constructor(public readonly userRepo: UserRepo, public readonly questionRepo: SecretQuestionRepo) {}
  async use(req: any, res: any, next: () => void) {
    try {
      req.body.validationErrors = [];
      const { newPassword_confirm, newPassword } = req.body;

      const greaterThan8 = new RegExp(/\S{8,}/, 'g');
      const atleastOneLowerCase = new RegExp(/[a-z]{1,}/, 'g');
      const atleastOneUpperCase = new RegExp(/[A-Z]{1,}/, 'g');
      const atleastOneNumber = new RegExp(/\d{1,}/, 'g');
      const atleastOneSpecialChar = new RegExp(/[!@#$%^&*]{1,}/, 'g');

      const isGreaterThan8 = greaterThan8.test(newPassword);
      const hasAtleastOneLowerCase = atleastOneLowerCase.test(newPassword);
      const hasAtleastOneUpperCase = atleastOneUpperCase.test(newPassword);
      const hasAtleastOneNumber = atleastOneNumber.test(newPassword);
      const hasAtleastOneSpecialChar = atleastOneSpecialChar.test(newPassword);
      if (!isGreaterThan8) {
        req.body.validationErrors.push('Password must be greater than or equal to 8 chars in length\n');
      }
      if (!hasAtleastOneLowerCase) {
        req.body.validationErrors.push('Password must contain at least one lowercase character\n');
      }
      if (!hasAtleastOneUpperCase) {
        req.body.validationErrors.push('Password must contain at least one uppercase character\n');
      }
      if (!hasAtleastOneNumber) {
        req.body.validationErrors.push('Password must contain at least one numeric character\n');
      }
      if (!hasAtleastOneSpecialChar) {
        req.body.validationErrors.push('Password must contain at least one special [!@#$%^&*] character\n');
      }
      if (newPassword_confirm !== newPassword) {
        req.body.validationErrors.push('Both passwords must be equal');
        throw new Error('Both passwords must be equal');
      }
      if (
        isGreaterThan8 &&
        hasAtleastOneLowerCase &&
        hasAtleastOneUpperCase &&
        hasAtleastOneNumber &&
        hasAtleastOneSpecialChar
      ) {
        next();
      } else {
        throw new Error('Password isnt strong enough');
      }
    } catch (err) {
      const locals = {
        title: 'GeoInnovation Service Center SSO',
        client: {},
        debug: false,
        details: {},
        params: {},
        interaction: true,
        error: true,
        message: req.body.validationErrors,
        token: req.body.token
      };
      return res.render('new-password', locals, (err, html) => {
        if (err) throw err;
        res.render('_password-reset-layout', {
          ...locals,
          body: html
        });
      });
    }
  }
}

@Injectable()
export class UserValidationMiddleware extends PasswordValidationMiddleware {
  async use(req: any, res: any, next: () => void) {
    try {
      req.body.validationErrors = [];
      const { confirm_password, password, email } = req.body;
      const existingUser = await this.userRepo.findByKeyShallow('email', email);
      const greaterThan8 = new RegExp(/\S{8,}/, 'g');
      const atleastOneLowerCase = new RegExp(/[a-z]{1,}/, 'g');
      const atleastOneUpperCase = new RegExp(/[A-Z]{1,}/, 'g');
      const atleastOneNumber = new RegExp(/\d{1,}/, 'g');
      const atleastOneSpecialChar = new RegExp(/[!@#$%^&*]{1,}/, 'g');

      const isGreaterThan8 = greaterThan8.test(password);
      const hasAtleastOneLowerCase = atleastOneLowerCase.test(password);
      const hasAtleastOneUpperCase = atleastOneUpperCase.test(password);
      const hasAtleastOneNumber = atleastOneNumber.test(password);
      const hasAtleastOneSpecialChar = atleastOneSpecialChar.test(password);
      if (!isGreaterThan8) {
        req.body.validationErrors.push('Password must be greater than or equal to 8 chars in length\n');
      }
      if (!hasAtleastOneLowerCase) {
        req.body.validationErrors.push('Password must contain at least one lowercase character\n');
      }
      if (!hasAtleastOneUpperCase) {
        req.body.validationErrors.push('Password must contain at least one uppercase character\n');
      }
      if (!hasAtleastOneNumber) {
        req.body.validationErrors.push('Password must contain at least one numeric character\n');
      }
      if (!hasAtleastOneSpecialChar) {
        req.body.validationErrors.push('Password must contain at least one special [!@#$%^&*] character\n');
      }

      if (existingUser || email.length < 8) {
        req.body.validationErrors.push('Invalid email');
        throw new Error('Invalid email');
      }
      if (confirm_password !== password) {
        req.body.validationErrors.push('Both passwords must be equal');
        throw new Error('Both passwords must be equal');
      }
      if (
        isGreaterThan8 &&
        hasAtleastOneLowerCase &&
        hasAtleastOneUpperCase &&
        hasAtleastOneNumber &&
        hasAtleastOneSpecialChar
      ) {
        next();
      } else {
        throw new Error('Password isnt strong enough');
      }
    } catch (err) {
      const locals = {
        title: 'GeoInnovation Service Center SSO',
        client: {},
        debug: false,
        details: {},
        params: {},
        interaction: true,
        error: true,
        message: req.body.validationErrors,
        questions: await this.questionRepo.find(),
        devMode: urlHas(req.path, 'dev', true),
        requestingHost: urlFragment('', 'hostname')
      };
      return res.render('register', locals, (err, html) => {
        if (err) throw err;
        res.render('_registration-layout', {
          ...locals,
          body: html
        });
      });
    }
  }
}
