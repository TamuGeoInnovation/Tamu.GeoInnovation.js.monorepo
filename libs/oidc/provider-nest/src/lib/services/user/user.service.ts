import { HttpService } from '@nestjs/common';
import { Connection, getConnection, Repository, Db, UpdateResult } from 'typeorm';
import { Request } from 'express';
import { SHA1HashUtils } from '../../_utils/sha1hash.util';
import { Mailer } from '../../_utils/mailer.util';

import {
  Account,
  User,
  UserRepo,
  AccountRepo,
  UserRole,
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
  UserPasswordReset
} from '../../entities/all.entity';

import { hash, compare } from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { TwoFactorAuthUtils } from '../../_utils/twofactorauth.util';

@Injectable()
export class UserService {
  private IPSTACK_APIKEY: string = '1e599a1240ca8f99f0b0d81a08324dbb';
  private IPSTACK_URL: string = 'http://api.ipstack.com/';
  constructor(
    public readonly userRepo: UserRepo,
    public readonly accountRepo: AccountRepo,
    public readonly roleRepo: RoleRepo,
    public readonly clientMetadataRepo: ClientMetadataRepo,
    public readonly userRoleRepo: UserRoleRepo,
    public readonly questionRepo: SecretQuestionRepo,
    public readonly answerRepo: SecretAnswerRepo,
    public readonly passwordResetRepo: UserPasswordResetRepo,
    public readonly passwordHistoryRepo: UserPasswordHistoryRepo,
    private readonly httpService: HttpService
  ) {}

  public async insertUser(req: Request) {
    const user: User = new User(req);
    const newAccount: Account = new Account(req.body.name, req.body.email);
    user.account = newAccount;
    const existingUser = await this.userRepo.findOne({
      where: {
        email: user.email
      }
    });

    if (existingUser) {
      // TODO: user already exists, do something about it
    }

    user.password = await hash(user.password, SHA1HashUtils.SALT_ROUNDS);
    const newUser = await this.userRepo.save(user);
    if (newUser) {
      await this.insertSecretAnswers(req, user);
      Mailer.sendAccountConfirmationEmail(newUser.email, newUser.guid);
      const _usedPassword: Partial<UserPasswordHistory> = {
        user: user,
        usedPassword: user.password
      };
      const usedPassword = await this.passwordHistoryRepo.create(_usedPassword);
      await this.passwordHistoryRepo.save(usedPassword);
      return newUser;
    }
  }

  public async userVerifiedEmail(guid: string) {
    const user = await this.userRepo.findOne({
      where: {
        guid: guid
      }
    });
    user.email_verified = true;
    this.userRepo.save(user);
  }

  public async sendPasswordResetEmail(req: Request) {
    const user = await this.userRepo.findByKeyDeep('guid', req.body.guid);
    const _resetRequest: Partial<UserPasswordReset> = {
      userGuid: user.guid,
      initializerIp: req.ip
    };
    const resetRequest = await this.passwordResetRepo.create(_resetRequest);
    resetRequest.setToken();
    // TODO: Is this subscribe a potential source of problems later on? Should we have to unsubscribe?
    this.httpService.get(`${this.IPSTACK_URL}${req.ip}?access_key=${this.IPSTACK_APIKEY}`).subscribe((observer) => {
      const location = observer.data.country_name;
      Mailer.sendPasswordResetRequestEmail(user, resetRequest, location);
      this.passwordResetRepo.save(resetRequest).catch((typeOrmErr) => {
        console.warn(typeOrmErr);
      });
    });
  }

  public async userLogin(email: string, password: string) {
    const userWithAccount = await this.userRepo.findByKeyDeep('email', email);
    if (userWithAccount) {
      const same = await compare(password, userWithAccount.password);
      if (same) {
        return userWithAccount;
      } else {
        return null;
      }
    }
  }

  public async enable2FA(guid: string): Promise<IServiceToControllerResponse | User> {
    // TODO: MAY WANT TO ADD A CHECK HERE TO PREVENT SOMEONE FROM OVERRIDING THE STORED SECRET
    // WHICH WOULD MAKE THE PERSON MORE OR LESS LOCKED OUT OF THEIR ACCOUNT SINCE THE SECRET
    // STORED IN AUTHENTICATOR IS WRONG NOW
    let ret: IServiceToControllerResponse;
    const newSecret = await TwoFactorAuthUtils.generateNewSecret();
    const user = await this.userRepo.findOne({
      where: {
        guid: guid
      }
    });
    if (!user.enabled2fa) {
      user.enabled2fa = true;
      user.secret2fa = newSecret;
      await this.userRepo.save(user);
      return user;
    } else {
      ret = {
        type: ServiceToControllerTypes.CONDITION_ALREADY_TRUE
      };
      return ret;
    }
  }

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

  public async insertUserRole(req: Request) {
    const existingUser = await this.userRepo.findByKeyDeep('email', req.body.email);
    if (existingUser) {
      // create new role, add it to existing user, save it\
      const roles = await this.roleRepo.findAllShallow();
      const requestedRole = roles.find((value, index) => {
        if (req.body.role.level == value.level) {
          return value;
        }
      });
      const clients = await this.clientMetadataRepo.findAllShallow();
      const requestedClient = clients.find((value, index) => {
        if (req.body.client.name == value.clientName) {
          return value;
        }
      });
      const newUserRole: Partial<UserRole> = {
        role: requestedRole,
        client: requestedClient,
        user: existingUser
      };
      const update = this.userRoleRepo.create(newUserRole);
      this.userRoleRepo.save(update);
    }
  }

  public async insertSecretQuestion(req: Request) {
    const questions: Partial<SecretQuestion>[] = [];
    req.body.questions.map((value) => {
      const question: Partial<SecretQuestion> = {
        questionText: value.questionText
      };
      questions.push(question);
    });
    const secretQuestions = this.questionRepo.create(questions);

    return this.questionRepo.insert(secretQuestions);
  }

  public async getAllSecretQuestions() {
    return this.questionRepo.find();
  }

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

  public async insertSecretAnswers(req: Request, user: User) {
    const _secretAnswer1: Partial<SecretAnswer> = {
      answer: await hash(req.body.secretanswer1.toLowerCase(), SHA1HashUtils.SALT_ROUNDS),
      secretQuestion: req.body.secretQuestion1,
      user: user
    };
    const _secretAnswer2: Partial<SecretAnswer> = {
      answer: await hash(req.body.secretanswer2.toLowerCase(), SHA1HashUtils.SALT_ROUNDS),
      secretQuestion: req.body.secretQuestion2,
      user: user
    };
    const secretAnswers = this.answerRepo.create([_secretAnswer1, _secretAnswer2]);
    if (secretAnswers) {
      this.answerRepo.save(secretAnswers).catch((typeOrmErr) => {
        console.warn(typeOrmErr);
      });
    }
  }

  public async isPasswordResetTokenStillValid(token: string) {
    const resetRequest = await this.passwordResetRepo.findByKeyShallow('token', token);
    if (new Date(resetRequest.expiresAt) >= new Date()) {
      return true;
    } else {
      return false;
    }
  }

  public async compareSecretAnswers(user: User, questionGuid: string, answer: string) {
    const secretAnswers = await this.answerRepo.findAllByKeyDeep('user', user.guid);
    for (var i = 0; i < secretAnswers.length; i++) {
      const secretAnswer = secretAnswers[i];
      if (secretAnswer.secretQuestion.guid === questionGuid) {
        return compare(answer, secretAnswer.answer);
      }
    }
  }

  public async areSecretAnswersCorrect(req: Request) {
    const { answer1, answer2, guid, question1, question2 } = req.body;
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

  public async ifNewUpdatePassword(req: Request, token: string) {
    const resetRequest = await this.passwordResetRepo.findByKeyShallow('token', token);
    const user = await this.userRepo.findByKeyShallow('guid', resetRequest.userGuid);
    const isUsed = await this.isNewPasswordUsed(req.body.newPassword, user);
    if (isUsed === false) {
      this.updateUserPassword(req, user);
      this.passwordResetRepo.delete(resetRequest);
      return true;
    } else {
      // used password
      return false;
    }
  }

  private async updateUserPassword(req: Request, user: User) {
    user.password = await hash(req.body.newPassword, SHA1HashUtils.SALT_ROUNDS);
    user.updatedAt = new Date().toISOString();
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
}

export interface IServiceToControllerResponse {
  message?: string;
  type?: ServiceToControllerTypes;
}

export enum ServiceToControllerTypes {
  CONDITION_ALREADY_TRUE,
  TASK_COMPLETE
}
