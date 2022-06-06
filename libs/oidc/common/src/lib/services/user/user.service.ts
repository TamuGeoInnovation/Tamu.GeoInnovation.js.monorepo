import { HttpService, Injectable } from '@nestjs/common';

import { hash, compare } from 'bcrypt';
import * as deepmerge from 'deepmerge';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';

import { Mailer } from '../../utils/email/mailer.util';
import { SHA1HashUtils } from '../../utils/security/sha1hash.util';
import { TwoFactorAuthUtils } from '../../utils/security/twofactorauth.util';
import {
  Account,
  User,
  UserRepo,
  AccountRepo,
  RoleRepo,
  ClientMetadataRepo,
  UserRoleRepo,
  SecretQuestion,
  SecretAnswer,
  SecretQuestionRepo,
  SecretAnswerRepo,
  UserPasswordHistory,
  UserPasswordResetRepo,
  UserPasswordHistoryRepo,
  UserPasswordReset,
  ClientRepo,
  NewUserRoleRepo
} from '../../entities/all.entity';

@Injectable()
export class UserService {
  constructor(
    public readonly userRepo: UserRepo,
    public readonly accountRepo: AccountRepo,
    public readonly roleRepo: RoleRepo,
    public readonly clientRepo: ClientRepo,
    public readonly newUserRoleRepo: NewUserRoleRepo,
    public readonly clientMetadataRepo: ClientMetadataRepo,
    public readonly userRoleRepo: UserRoleRepo,
    public readonly questionRepo: SecretQuestionRepo,
    public readonly answerRepo: SecretAnswerRepo,
    public readonly passwordResetRepo: UserPasswordResetRepo,
    public readonly passwordHistoryRepo: UserPasswordHistoryRepo,
    private readonly httpService: HttpService,
    private readonly env: EnvironmentService
  ) {}

  public async insertDefaultAdmin() {
    const adminEmail = this.env.value('email');

    const existing = await this.userRepo.findOne({
      where: {
        email: adminEmail
      }
    });

    if (existing) {
      return;
    }

    const account = this.accountRepo.create({
      name: 'Administrator'
    });

    await this.userRepo
      .create({
        account: account,
        email: adminEmail,
        password: await hash(this.env.value('password'), SHA1HashUtils.SALT_ROUNDS),
        added: new Date(Date.now()),
        updatedAt: new Date(Date.now())
      })
      .save();
  }

  public async insertDefaultSecretQuestions() {
    const existing = await this.questionRepo.count();
    if (existing) {
      return;
    } else {
      const questions = [
        {
          questionText: 'What was the house number and street name you lived in as a child?'
        },
        {
          questionText: 'What were the last four digits of your childhood telephone number?'
        },
        {
          questionText: 'What elementary school did you attend?'
        },
        {
          questionText: 'In what town or city was your first full time job?'
        },
        {
          questionText: 'In what town or city did you meet your spouse or partner?'
        },
        {
          questionText: 'What is the middle name of your oldest child?'
        }
      ];

      const promises = questions.map((question: Partial<SecretQuestion>) => {
        return this.questionRepo.create(question).save();
      });

      await Promise.allSettled(promises);
    }
  }

  /**
   * Function used to insert a new user given an Express Request.
   */
  public async insertUser(user: User, name: string) {
    const newAccount: Account = new Account(name);
    user.account = newAccount;

    const existingUser = await this.userRepo.findOne({
      where: {
        email: user.email
      }
    });

    if (existingUser) {
      // TODO: user already exists, do something about it
      return;
    }

    user.password = await hash(user.password, SHA1HashUtils.SALT_ROUNDS);
    const newUser = await this.userRepo.save(user);
    if (newUser) {
      Mailer.sendAccountConfirmationEmail(newUser.email, newUser.guid);

      const _usedPassword: Partial<UserPasswordHistory> = {
        user: newUser,
        usedPassword: newUser.password
      };

      const usedPassword = await this.passwordHistoryRepo.create(_usedPassword);

      await this.passwordHistoryRepo.save(usedPassword);

      return newUser;
    }
  }

  public async updateUser(updatedUser: Partial<User>) {
    const user = await this.userRepo.findOne({
      where: {
        guid: updatedUser.guid
      },
      relations: ['account']
    });

    if (user) {
      const merged = deepmerge(user, updatedUser);
      await this.userRepo.save(merged);
    }
  }

  /**
   * Function used to update the "email_verified" attribute to true
   */
  public async userVerifiedEmail(guid: string) {
    const user = await this.userRepo.findOne({
      where: {
        guid: guid
      }
    });
    user.email_verified = true;

    this.userRepo.save(user);
  }

  /**
   * Function used to generate a new PasswordReset entity and send an email
   * to the user with instructions on how to reset their password.
   *
   */
  public async sendPasswordResetEmail(guid: string, email: string, ip: string) {
    let user: User;

    if (guid) {
      user = await this.userRepo.findByKeyDeep('guid', guid);
    } else if (email) {
      user = await this.userRepo.findByKeyDeep('email', email);
    }

    const _resetRequest: Partial<UserPasswordReset> = {
      userGuid: user.guid,
      initializerIp: ip
    };

    const resetRequest = await this.passwordResetRepo.create(_resetRequest);
    resetRequest.setToken();

    // TODO: Disabled for now because of too many API calls to ipstack; maybe we investigate other providers or scrap this functionality
    // Is this subscribe a potential source of problems later on? Should we have to unsubscribe?
    // this.httpService.get(`${this.IPSTACK_URL}${ip}?access_key=${this.IPSTACK_APIKEY}`).subscribe((observer) => {
    //   const location = observer.data.country_name;

    //   Mailer.sendPasswordResetRequestEmail(user, resetRequest, location);
    //   this.passwordResetRepo.save(resetRequest).catch((typeOrmErr) => {
    //     console.warn(typeOrmErr);
    //   });
    // });
  }

  /**
   * Function that will determine if the email and password provided at login
   * are accurate. If so, will return the user that matches this combination.
   */
  public async userLogin(email: string, password: string) {
    const userWithAccount = await this.userRepo.getUserWithPassword(email);

    if (userWithAccount) {
      const same = await compare(password, userWithAccount.password);

      if (same) {
        return userWithAccount;
      } else {
        return null;
      }
    }
  }

  /**
   * Function used to set "enabled2fa" to true and generate a new 2fa secret for a user; saves the result
   */
  public async enable2FA(user: User) {
    if (user.enabled2fa === false) {
      const newSecret = TwoFactorAuthUtils.generateNewSecret();
      user.enabled2fa = true;
      user.secret2fa = newSecret;
      await this.userRepo.save(user);
    }

    return user;
  }

  /**
   * Function used to set "enabled2fa" to false and remove "secret2fa"
   */
  public async disable2fa(guid: string) {
    const user = await this.userRepo.findOne({
      where: {
        guid: guid
      }
    });

    if (user && user.enabled2fa) {
      user.enabled2fa = false;
      user.secret2fa = null;
      return await this.userRepo.save(user);
    }
  }

  /**
   * Function used to insert a series of secret questions
   */
  public async insertSecretQuestion(questions: Partial<SecretQuestion>[]) {
    const secretQuestions = this.questionRepo.create(questions);

    return this.questionRepo.insert(secretQuestions);
  }

  /**
   * Function used to return all of the secret questions in the db
   */
  public async getAllSecretQuestions() {
    return this.questionRepo.find();
  }

  /**
   * Function used to get the secret quetsions associated with a user
   * and return them in a simple object with question guid and question text
   */
  public async getUsersQuestions(user: User) {
    const questionsAndAnswers = await this.answerRepo.findAllByKeyDeep('user', user.guid);

    const questions: {
      text: string;
      guid: string;
    }[] = [];

    const len = questionsAndAnswers.length;

    for (let i = 0; i < len; i++) {
      const secretAnswer = questionsAndAnswers[i];

      questions.push({
        guid: secretAnswer.secretQuestion.guid,
        text: secretAnswer.secretQuestion.questionText
      });
    }

    return questions;
  }

  /**
   * Function used to insert the secret answers provided by a user upon registration
   */
  public async insertSecretAnswers(
    question1Guid: string,
    question2Guid: string,
    secretAnswer1: string,
    secretAnswer2: string,
    user: User
  ) {
    const secretQuestion1 = await this.questionRepo.findOne({
      where: {
        guid: question1Guid
      }
    });

    const secretQuestion2 = await this.questionRepo.findOne({
      where: {
        guid: question2Guid
      }
    });

    const _secretAnswer1: Partial<SecretAnswer> = {
      answer: await hash(secretAnswer1.toLowerCase(), SHA1HashUtils.SALT_ROUNDS),
      secretQuestion: secretQuestion1,
      user: user
    };

    const _secretAnswer2: Partial<SecretAnswer> = {
      answer: await hash(secretAnswer2.toLowerCase(), SHA1HashUtils.SALT_ROUNDS),
      secretQuestion: secretQuestion2,
      user: user
    };

    const secretAnswers = this.answerRepo.create([_secretAnswer1, _secretAnswer2]);
    if (secretAnswers) {
      this.answerRepo.save(secretAnswers).catch((typeOrmErr) => {
        console.warn(typeOrmErr);
      });
    }
  }

  /**
   * Function that will check to see if a given UserPasswortReset token is still valid
   */
  public async isPasswordResetTokenStillValid(token: string) {
    const resetRequest = await this.passwordResetRepo.findByKeyShallow('token', token);

    if (new Date(resetRequest.expiresAt) >= new Date()) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Function that will determine if the answers provided match the secret answer hashes we have stored
   */
  public async areSecretAnswersCorrect(
    answer1: string,
    answer2: string,
    guid: string,
    question1: string,
    question2: string
  ) {
    const user = await this.userRepo.findOne({
      where: {
        guid: guid
      }
    });

    const secretAnswers = await this.answerRepo.findAllByKeyDeep('user', user.guid);
    let answer1correct = false;
    let answer2correct = false;

    for (let i = 0; i < secretAnswers.length; i++) {
      const secretAnswer = secretAnswers[i];
      if (secretAnswer.secretQuestion.guid === question1) {
        answer1correct = compare(answer1, secretAnswer.answer);
      }
      if (secretAnswer.secretQuestion.guid === question2) {
        answer2correct = compare(answer2, secretAnswer.answer);
      }
    }
    if (answer1correct && answer2correct) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Function that will determine if the new password given has been used in the past.
   */
  public async isNewPasswordUsed(newPassword: string, user: User) {
    const oldPasswords = await this.passwordHistoryRepo.find({
      where: {
        user: user
      }
    });
    if (oldPasswords) {
      const len = oldPasswords.length;
      for (let i = 0; i < len; i++) {
        const areSame = await compare(newPassword, oldPasswords[i].usedPassword);
        if (areSame) {
          // they're the same
          return true;
        }
      }
      return false;
    } else {
      return false;
    }
  }

  /**
   * Function that will update the user's password if the new password provided hasn't been used before
   */
  public async ifNewUpdatePassword(newPassword: string, token: string) {
    const resetRequest = await this.passwordResetRepo.findByKeyShallow('token', token);
    const user = await this.userRepo.findByKeyShallow('guid', resetRequest.userGuid);
    const isUsed = await this.isNewPasswordUsed(newPassword, user);
    if (isUsed === false) {
      this.updateUserPassword(newPassword, user);
      this.passwordResetRepo.delete(resetRequest);
      return true;
    } else {
      // used password
      return false;
    }
  }

  /**
   * Function that will update the user's password and send an email saying their password has been changed
   */
  private async updateUserPassword(newPassword: string, user: User) {
    user.password = await hash(newPassword, SHA1HashUtils.SALT_ROUNDS);
    user.updatedAt = new Date();
    this.userRepo.save(user);
    Mailer.sendPasswordResetConfirmationEmail(user.email);
    const _newUsedPassword: Partial<UserPasswordHistory> = {
      user: user,
      usedPassword: user.password
    };
    const newUsedPassword = await this.passwordHistoryRepo.create(_newUsedPassword);
    this.passwordHistoryRepo.save(newUsedPassword);
    return true;
  }

  public async removeUser(guid: string) {
    const user = await this.userRepo.findOne({
      where: {
        guid: guid
      }
    });
    if (user) {
      user.remove();
    }
  }
}
