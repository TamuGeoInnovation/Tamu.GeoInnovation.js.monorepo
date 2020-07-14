import { Connection, getConnection, Repository, Db, UpdateResult } from 'typeorm';
import { Request } from 'express';
import { hashSync } from 'bcrypt';
import { SHA1HashUtils } from '../../_utils/sha1hash.util';
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
  UserPasswordResetRepo
} from '../../entities/all.entity';

import { hash, compare } from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { TwoFactorAuthUtils } from '../../_utils/twofactorauth.util';

@Injectable()
export class UserService {
  constructor(
    public readonly userRepo: UserRepo,
    public readonly accountRepo: AccountRepo,
    public readonly roleRepo: RoleRepo,
    public readonly clientMetadataRepo: ClientMetadataRepo,
    public readonly userRoleRepo: UserRoleRepo,
    public readonly questionRepo: SecretQuestionRepo,
    public readonly answerRepo: SecretAnswerRepo,
    public readonly passwordResetRepo: UserPasswordResetRepo
  ) {}

  public async insertUser(user: User) {
    const existingUser = await this.userRepo.findOne({
      where: {
        email: user.email
      }
    });

    if (existingUser) {
      // user already exists, do something about it
    }

    user.password = await hash(user.password, SHA1HashUtils.SALT_ROUNDS);
    await this.userRepo.save(user);
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
    const _secretQuestion: Partial<SecretQuestion> = {
      questionText: req.body.questionText
    };
    const secretQuestion = this.questionRepo.create(_secretQuestion);
    return this.questionRepo.insert(secretQuestion);
  }

  public async getAllSecretQuestions() {
    return this.questionRepo.find();
  }

  public async insertSecretAnswers(req: Request, user: User) {
    const _secretAnswer1: Partial<SecretAnswer> = {
      answer: hashSync(req.body.secretanswer1, SHA1HashUtils.SALT_ROUNDS),
      secretQuestion: req.body.secretQuestion1,
      user: user
    };
    const _secretAnswer2: Partial<SecretAnswer> = {
      answer: hashSync(req.body.secretanswer2, SHA1HashUtils.SALT_ROUNDS),
      secretQuestion: req.body.secretQuestion2,
      user: user
    };
    const secretAnswer1 = this.answerRepo.create(_secretAnswer1);
    const secretAnswer2 = this.answerRepo.create(_secretAnswer2);
    if (secretAnswer1) {
      this.answerRepo.save(secretAnswer1);
    }
    if (secretAnswer2) {
      this.answerRepo.save(secretAnswer2);
    }
  }

  public async isPasswordResetLinkStillValid(token: string) {
    const resetRequest = await this.passwordResetRepo.findByKeyShallow('token', token);
    if (new Date(resetRequest.expiresAt) >= new Date()) {
      return true;
    } else {
      return false;
    }
  }

  public async compareSecretAnswers(user: User, questionGuid: string, answer: string) {
    const secretAnswer = await this.answerRepo.findByKeyDeep('user', user);
    return compare(answer, secretAnswer.answer);
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
