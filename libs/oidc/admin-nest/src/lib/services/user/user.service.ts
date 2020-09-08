import { HttpService } from '@nestjs/common';
import { Connection, getConnection, Repository, Db, UpdateResult, Like } from 'typeorm';
import { Request } from 'express';
import * as deepmerge from 'deepmerge';
import { SHA1HashUtils, Mailer } from '@tamu-gisc/oidc/utils';

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
  UserPasswordReset,
  INewRole
} from '../../entities/all.entity';

import { hash, compare } from 'bcrypt';
import { Injectable } from '@nestjs/common';

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
  /**
   * Function used to insert a new user given an Express Request.
   *
   * @param {Request} req
   * @returns
   * @memberof UserService
   */
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
      return;
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

  public async getUser(guid: string) {
    const user = await this.userRepo.findOne({
      where: {
        guid: guid
      },
      relations: ['account', 'userRoles']
    });
    return user;
  }

  public async getUserWithRoles(guid: string) {
    const user = await this.userRepo.findByKeyDeep('guid', guid);
    // const userWithRoles = await this.userRepo.getUserWithRoles(user.guid, 'oidc-client-test');
    const roles: UserRole[] = await this.userRoleRepo.findAllByKeyDeep('guid', 'b2c4dfe3-befe-4b04-ae26-0e107b0c17a7');
    user.userRoles = roles;
    // user.userRoles.forEach(async (userRole: UserRole) => {
    //   const joe = await this.userRoleRepo.findByKeyDeep('guid', userRole.guid);
    //   debugger;
    // });
    return user;
  }

  public async updateUser(req: Request) {
    const userGuid = req.body.guid;
    const user = await this.userRepo.findByKeyDeep('guid', userGuid);
    const merged = deepmerge(user as Partial<User>, req.body);
    // const updatedUser: User = new User(merged);
    return this.userRepo.save(merged);

    // const _user: Partial<User> = {
    //   ...req.body
    // };
    // const user = this.userRepo.create(_user);

    // return this.roleRepo.save(updatedUser);
    // merged.save();
    // debugger;
  }

  public async deleteUser(userGuid: string) {
    const user = await this.userRepo.findOne({
      where: {
        guid: userGuid
      }
    });
    return this.userRepo.remove(user, {});
  }

  /**
   * Function used to set "enabled2fa" to false and remove "secret2fa"
   *
   * @param {string} guid
   * @returns
   * @memberof UserService
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
   * Function that will set a user's role for a given clientId.
   *
   * @param {Request} req
   * @memberof UserService
   */
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
        client: requestedClient
        // user: existingUser
      };
      const update = this.userRoleRepo.create(newUserRole);
      return this.userRoleRepo.save(update);
    } else {
      // user does not exist
      return;
    }
  }

  private async insertNewUserRole(newRole: INewRole, existingUser: User) {
    const roles = await this.roleRepo.findAllShallow();
    const requestedRole = roles.find((value, index) => {
      if (newRole.roleGuid == value.guid) {
        return value;
      }
    });
    const clients = await this.clientMetadataRepo.findAllShallow();
    const requestedClient = clients.find((value, index) => {
      if (newRole.clientGuid == value.guid) {
        return value;
      }
    });
    const newUserRole: Partial<UserRole> = {
      role: requestedRole,
      client: requestedClient,
      user: existingUser
    };
    const update = this.userRoleRepo.create(newUserRole);
    return this.userRoleRepo.save(update);
  }

  public async updateUserRole(req: Request) {
    // const existingUser = await this.userRepo.findByKeyDeep('email', req.body.email);
    const newRole: INewRole = req.body;
    const userGuid: string = newRole.userGuid;
    const existingUser = await this.userRepo.findOne({
      where: {
        guid: userGuid
      }
    });
    if (existingUser) {
      // check if user even has roles
      if (existingUser.userRoles.length === 0) {
        // if the user has no roles, check to see if the front end sent a roleGuid
        if (newRole.roleGuid !== 'undefined' && newRole.roleGuid !== undefined) {
          // if roleGuid was found, insert a new role
          this.insertNewUserRole(newRole, existingUser);
        } else {
          // no roleguid was found, skip
          console.log('Skipping this since the roleGuid is undefined');
        }
      } else {
        // Since user has roles, iterate through them
        // existingUser.userRoles.forEach((userRole: UserRole) => {
        for (const userRole of existingUser.userRoles) {
          // check if newRole is equal in clientGuid and roleGuid, if so, do nothing
          if (newRole.clientGuid === userRole.client.guid && newRole.roleGuid === userRole.role.guid) {
            // console.log('Existing client / role combo');
            return;
          }
          // if newRole is same clientGuid but undefined roleGuid, then delete it
          else if (
            newRole.clientGuid === userRole.client.guid &&
            (newRole.roleGuid === undefined || newRole.roleGuid === 'undefined')
          ) {
            // console.log('Removing existing role');
            this.userRoleRepo.delete(userRole);
          }
          // if this newRole is same clientGuid but different roleGuid, update it
          else if (newRole.clientGuid === userRole.client.guid && newRole.roleGuid !== userRole.role.guid) {
            console.log('Existing client / role combo, updating');
            // Get new role
            const _newRole = await this.roleRepo.findOne({
              where: {
                guid: newRole.roleGuid
              }
            });
            // update existing userRole with new role
            userRole.role = _newRole;
            userRole.save();
          }
          // if we had existing userRoles, but not one for this particular clientGuid, insert it
          else if (newRole.clientGuid !== userRole.client.guid) {
            if (newRole.roleGuid !== 'undefined' && newRole.roleGuid !== undefined) {
              this.insertNewUserRole(newRole, existingUser);
            } else {
              console.log('Skipping this since the roleGuid is undefined');
            }
            return;
          } else {
            return;
          }
        }
      }
    } else {
      // user does not exist
      return;
    }
  }

  /**
   * Function used to insert a series of secret questions
   *
   * @param {Request} req
   * @returns
   * @memberof UserService
   */
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

  /**
   * Function used to return all of the secret questions in the db
   *
   * @returns
   * @memberof UserService
   */
  public async getAllSecretQuestions() {
    return this.questionRepo.find();
  }

  /**
   * Function used to get the secret quetsions associated with a user
   * and return them in a simple object with question guid and question text
   *
   * @param {User} user
   * @returns
   * @memberof UserService
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
   *
   * @param {Request} req
   * @param {User} user
   * @memberof UserService
   */
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

  /**
   * Function that will check to see if a given UserPasswortReset token is still valid
   *
   * @param {string} token
   * @returns
   * @memberof UserService
   */
  public async isPasswordResetTokenStillValid(token: string) {
    const resetRequest = await this.passwordResetRepo.findByKeyShallow('token', token);
    if (new Date(resetRequest.expiresAt) >= new Date()) {
      return true;
    } else {
      return false;
    }
  }

  // TODO: I think we can delete this function; was used before moving logic to the service
  public async compareSecretAnswers(user: User, questionGuid: string, answer: string) {
    const secretAnswers = await this.answerRepo.findAllByKeyDeep('user', user.guid);
    for (var i = 0; i < secretAnswers.length; i++) {
      const secretAnswer = secretAnswers[i];
      if (secretAnswer.secretQuestion.guid === questionGuid) {
        return compare(answer, secretAnswer.answer);
      }
    }
  }

  /**
   * Function that will determine if the answers provided match the secret answer hashes we have stored
   *
   * @param {Request} req
   * @returns
   * @memberof UserService
   */
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

  /**
   * Function that will determine if the new password given has been used in the past.
   *
   * @param {string} newPassword
   * @param {User} user
   * @returns
   * @memberof UserService
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
   *
   * @param {Request} req
   * @param {string} token
   * @returns
   * @memberof UserService
   */
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

  /**
   * Function that will update the user's password and send an email saying their password has been changed
   *
   * @private
   * @param {Request} req
   * @param {User} user
   * @returns
   * @memberof UserService
   */
  private async updateUserPassword(req: Request, user: User) {
    user.password = await hash(req.body.newPassword, SHA1HashUtils.SALT_ROUNDS);
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
}

export interface IServiceToControllerResponse {
  message?: string;
  type?: ServiceToControllerTypes;
}

export enum ServiceToControllerTypes {
  CONDITION_ALREADY_TRUE,
  TASK_COMPLETE
}
