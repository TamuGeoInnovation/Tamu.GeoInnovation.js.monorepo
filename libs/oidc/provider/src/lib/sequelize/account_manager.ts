import bcrypt from 'bcrypt';
import { DbManager } from './DbManager';
import { IAccountAttrs, ITAMUAttrs } from '../models/Accounts/accounts';
import { IUsersAttrs, IUsersInstance } from '../models/Users/users';
import * as Sequelize from 'sequelize';
import { TwoFactorAuthUtils } from '../_utils/twofactorauth.util';

export class AccountManager {
  public static SALT_ROUNDS = 12;

  public static async ensureDbIsSynced() {
    if (!DbManager.db) {
      DbManager.setup();
    }
  }

  public static async getAccountClaims(id: string) {
    return new Promise((resolve, reject) => {
      DbManager.db.Accounts.find({
        where: {
          sub: id
        }
      })
        .then((account) => {
          resolve({
            ...account
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async getAccountTAMU(id: string) {
    return new Promise((resolve, reject) => {
      const accounts = DbManager.db.Accounts;
      const tamu = DbManager.db.AccountsTAMU;
      tamu.belongsTo(accounts, {
        targetKey: 'sub',
        foreignKey: 'sub'
      });
      DbManager.sync();
      tamu
        .find({
          include: [
            {
              model: accounts,
              where: {
                sub: id
              }
            }
          ]
        })
        .then((result: any) => {
          if (!result) {
            resolve(false);
          } else {
            resolve({
              uin_tamu: result.uin_tamu,
              sub: result.sub,
              fieldofstudy_tamu: result.fieldofstudy_tamu,
              department_tamu: result.department_tamu,
              classification_tamu: result.classification_tamu,
              ...result.dataValues.account,
              ...result.dataValues
            });
          }
        })
        .catch((error) => {
          throw new Error('Account is not of type TAMU');
        });
    });
  }

  public static async getAccount(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const accounts = DbManager.db.Accounts;
      accounts
        .find({
          where: {
            sub: id
          }
        })
        .then((result: any) => {
          if (!result) {
            resolve(false);
          } else {
            resolve({
              ...result.dataValues
            });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async isAccountEmailVerified(sub: string) {
    return new Promise((resolve, reject) => {
      const accounts = DbManager.db.Accounts;
      accounts
        .find({
          where: {
            sub,
            email_verified: true
          }
        })
        .then((result) => {
          if (result) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async getAccountAccess(id: string) {
    return new Promise((resolve, reject) => {
      const accounts = DbManager.db.Accounts;
      const roles = DbManager.db.RolesAC;
      const userroles = DbManager.db.UserRolesAC;
      userroles.belongsTo(accounts, {
        targetKey: 'sub',
        foreignKey: 'userGuid'
      });
      userroles.hasOne(roles, {
        foreignKey: 'id'
      });
      DbManager.db.sequelize.sync();
      userroles
        .find({
          include: [
            {
              model: accounts,
              where: {
                sub: id
              }
            },
            {
              model: roles
            }
          ]
        })
        .then((result: any) => {
          resolve({
            // roleId: result.roleId,
            ...result
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async getAllAccounts() {
    return new Promise((resolve, reject) => {
      DbManager.sync().then((result) => {
        const accounts = DbManager.db.Accounts;
        accounts
          .findAll()
          .then((accounts) => {
            resolve(accounts);
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  }

  public static async updateAccount(account: IAccountAttrs) {
    return new Promise((resolve, reject) => {
      const accounts = DbManager.db.Accounts;
      accounts
        .update(
          {
            ...account
          },
          {
            where: {
              sub: account.sub
            }
          }
        )
        .then((accounts) => {
          resolve(accounts);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async registerAccount(account: IAccountAttrs, siteGuid: string) {
    return new Promise((resolve, reject) => {
      const accounts = DbManager.db.Accounts;
      // TODO: MAKE THIS SEARCH FOR AN EXISTING SUB / SITEGUID COMBO BEFORE INSERTING NEW USER
      // TODO: MAKE SURE TO INPUT INTO THE USER TABLE AS WELL
      this.getAccountTAMU(account.sub).then((exists) => {
        if (exists) {
          const newUserRole = DbManager.db.UserRolesAC;
          newUserRole
            .upsert({
              roleId: 3,
              siteGuid: siteGuid,
              userId: '',
              userGuid: account.sub
            })
            .then((result) => {
              resolve(result);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          accounts
            .upsert({
              address: account.address,
              birthdate: account.birthdate,
              email: account.email,
              family_name: account.family_name,
              gender: account.gender,
              given_name: account.given_name,
              locale: account.locale,
              name: account.name,
              nickname: account.nickname,
              phone_number: account.phone_number,
              picture: account.picture,
              profile: account.profile,
              sub: account.sub,
              website: account.website,
              zoneinfo: account.zoneinfo,
              email_verified: false,
              phone_number_verified: false,
              updated_at: Date.now().toString(),
              added: Date.now().toString(),
              last_edited: Date.now().toString(),
              signup_ip_address: account.signup_ip_address,
              last_used_ip_address: account.last_used_ip_address,
              recovery_email: account.recovery_email,
              recovery_email_verified: account.recovery_email_verified
            })
            .then((result) => {
              resolve(result);
            })
            .catch((error) => {
              reject(error);
            });
        }
      });
    });
  }

  public static async verifyUserEmail(sub: string) {
    return new Promise((resolve, reject) => {
      const accounts = DbManager.db.Accounts;
      accounts
        .update(
          {
            email_verified: true
          },
          {
            where: {
              sub
            }
          }
        )
        .then((result) => {
          if (result) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async registerTAMUAccount(account: ITAMUAttrs) {
    return new Promise((resolve, reject) => {
      const accounts = DbManager.db.AccountsTAMU;
      // TODO: MAKE THIS SEARCH FOR AN EXISTING SUB / SITEGUID COMBO BEFORE INSERTING NEW USER
      // TODO: MAKE SURE TO INPUT INTO THE USER TABLE AS WELL
      accounts
        .upsert({
          sub: account.sub,
          uin_tamu: account.uin_tamu,
          department_tamu: account.department_tamu,
          fieldofstudy_tamu: account.fieldofstudy_tamu,
          classification_tamu: account.classification_tamu,
          completed_initial_survey_tamu: account.completed_initial_survey_tamu
        })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async registerUser(user: IUsersAttrs) {
    return new Promise((resolve, reject) => {
      const users = DbManager.db.Users;
      // TODO: MAKE THIS SEARCH FOR AN EXISTING SUB / SITEGUID COMBO BEFORE INSERTING NEW USER
      // TODO: MAKE SURE TO INPUT INTO THE USER TABLE AS WELL
      users
        .findOne({
          where: {
            email: user.email
          }
        })
        .then((result) => {
          if (!result) {
            const password = bcrypt.hashSync(user.password, this.SALT_ROUNDS);
            users
              .upsert({
                sub: user.sub,
                email: user.email,
                password: password,
                updatedAt: Date.now().toString(),
                enabled2fa: false,
                secret2fa: null
              })
              .then((result) => {
                resolve(result);
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            resolve();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }

  public static async updateUserPassword(sub: string, newPassword: string) {
    return new Promise((resolve, reject) => {
      const users = DbManager.db.Users;
      // TODO: MAKE THIS SEARCH FOR AN EXISTING SUB / SITEGUID COMBO BEFORE INSERTING NEW USER
      // TODO: MAKE SURE TO INPUT INTO THE USER TABLE AS WELL
      users
        .findOne({
          where: {
            sub
          }
        })
        .then((result) => {
          if (result) {
            const newPasswordHash = bcrypt.hashSync(newPassword, this.SALT_ROUNDS);
            users
              .update(
                {
                  password: newPasswordHash,
                  updatedAt: Date.now().toString()
                },
                {
                  where: {
                    sub
                  }
                }
              )
              .then((result) => {
                resolve(result);
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            resolve();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }

  public static async getRoleByUserGuid(id: string) {
    return new Promise((resolve, reject) => {
      const roles = DbManager.db.RolesAC;
      const userroles = DbManager.db.UserRolesAC;
      roles.hasOne(userroles, {
        foreignKey: 'roleId'
      });
      userroles.belongsTo(roles, {
        foreignKey: 'roleId'
      });
      DbManager.db.sequelize.sync();
      userroles
        .find({
          include: [
            {
              model: roles
            }
          ],
          where: {
            userGuid: id
          }
        })
        .then((result: any) => {
          // TODO: DOES THIS SCALE WITH MULTIPLE SITES?
          resolve({
            role: result.dataValues.access_control_role.name,
            level: result.dataValues.access_control_role.level
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async getUsersRoleBySite(userGuid: string, clientId: string) {
    return new Promise((resolve, reject) => {
      const sites = DbManager.db.Sites;
      const userRoles = DbManager.db.UserRolesAC;
      const roles = DbManager.db.RolesAC;

      sites.hasOne(userRoles, {
        foreignKey: 'siteGuid'
      });

      roles.hasOne(userRoles, {
        foreignKey: 'roleId'
      });

      userRoles.belongsTo(sites, {
        foreignKey: 'siteGuid'
      });

      userRoles.belongsTo(roles, {
        foreignKey: 'roleId'
      });

      DbManager.db.sequelize.sync();
      userRoles
        .find({
          include: [
            {
              model: roles
            },
            {
              model: sites,
              where: {
                siteName: clientId
              }
            }
          ],
          where: {
            userGuid: userGuid
          }
        })
        .then((result: any) => {
          // TODO: WHY DOES THIS RETURN SO LITTLE?
          if (result) {
            resolve({
              role: result.dataValues.access_control_role.name,
              level: result.dataValues.access_control_role.level
            });
          } else {
            resolve(false);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async createNewRole(level: number, name: string) {
    return new Promise((resolve, reject) => {
      const roles = DbManager.db.RolesAC;
      DbManager.db.sequelize.sync();
      roles
        .upsert({
          level: level,
          name: name
        })
        .then((result) => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async addUserRole(siteGuid: string, roleId: number, userGuid: string) {
    return new Promise((resolve, reject) => {
      const userroles = DbManager.db.UserRolesAC;
      DbManager.db.sequelize.sync();

      userroles
        .upsert({
          siteGuid: siteGuid,
          roleId: roleId,
          userGuid: userGuid
        })
        .then((result) => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async findUserEmail(email: string) {
    return new Promise((resolve, reject) => {
      const users = DbManager.db.Users;
      users
        .findOne({
          where: {
            email: email
          }
        })
        .then((user) => {
          if (user) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  public static async findUser(email: string, pw: string): Promise<{ user: IUsersInstance }> {
    // use bcrypt compareSync to compare the plaintext pw with the stored hash
    return new Promise((resolve, reject) => {
      const users = DbManager.db.Users;
      users
        .findOne({
          where: {
            email: email
          }
        })
        .then((user) => {
          if (user) {
            const same = bcrypt.compareSync(pw, user.password);
            if (same) {
              resolve({
                user
              });
            } else {
              // reject();
              resolve();
            }
          } else {
            // reject(); // seems reject() doesn't work well here, maybe reject() is only for when it actually fails
            resolve();
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  public static async getUser(sub: string) {
    const users = DbManager.db.Users;
    return users.findOne({
      where: {
        sub
      }
    });
  }

  public static async updateAccountLastIPAddress(sub: string, lastUsedIP: string) {
    return new Promise((resolve, reject) => {
      const accounts = DbManager.db.Accounts;
      accounts
        .update(
          {
            last_used_ip_address: lastUsedIP
          },
          {
            where: {
              sub
            }
          }
        )
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async getAllSecretQuestions() {
    return new Promise((resolve, reject) => {
      const questions = DbManager.db.SecretQuestions;
      questions
        .findAll()
        .then((questions) => {
          if (questions) {
            resolve(questions);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async getSecretQuestionsByUserSub(userSub: string) {
    return new Promise((resolve, reject) => {
      const answers = DbManager.db.SecretAnswers;
      const questions = DbManager.db.SecretQuestions;

      questions.hasOne(answers, {
        foreignKey: 'question_id' // Using "id" as the foreignKey produces incorrect join
      });
      // questions.belongsTo(answers, {
      //   foreignKey: "id"
      // })
      questions
        .findAll({
          include: [
            {
              model: answers,
              where: {
                accounts_sub: userSub
              }
            }
          ]
        })
        .then((results) => {
          // console.log(results);
          resolve(results);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async insertSecretAnswer(userSub: string, questionId: string, questionAnswer: string) {
    return new Promise((resolve, reject) => {
      const answers = DbManager.db.SecretAnswers;
      const bcryptedAnswer = bcrypt.hashSync(questionAnswer, this.SALT_ROUNDS);
      answers
        .upsert({
          accounts_sub: userSub,
          question_id: questionId,
          answer: bcryptedAnswer
        })
        .then((result) => {
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async insertNewPWResetRequest(sub: string, token: string, ipOfInitializer: string) {
    return new Promise((resolve, reject) => {
      const pwreset = DbManager.db.ResetPW;
      pwreset
        .upsert({
          account_sub: sub,
          token: token,
          initializer_ip: ipOfInitializer,
          createdAt: Date.now().toString(),
          expiresAt: (Date.now() + 10 * 60 * 1000).toString() // Should be a 10 min expiration
        })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async isResetLinkStillValid(token: string) {
    return new Promise((resolve, reject) => {
      const pwreset = DbManager.db.ResetPW;
      const Op = Sequelize.Op;
      pwreset
        .find({
          where: {
            token: token,
            expiresAt: {
              [Op.gt]: Date.now().toString()
            }
          }
        })
        .then((result) => {
          if (result) {
            resolve(result);
          } else {
            resolve(false);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async compareSecretAnswers(id: string, questionId: string, answer: string) {
    // use bcrypt compareSync to compare the plaintext pw with the stored hash
    return new Promise((resolve, reject) => {
      const pwreset = DbManager.db.ResetPW;
      const answers = DbManager.db.SecretAnswers;
      const Op = Sequelize.Op;

      pwreset
        .find({
          where: {
            token: id,
            expiresAt: {
              [Op.gt]: Date.now().toString()
            }
          }
        })
        .then((request: any) => {
          if (request) {
            const num = Number(questionId);
            answers
              .find({
                where: {
                  accounts_sub: request.account_sub,
                  question_id: num
                }
              })
              .then((secondResult: any) => {
                if (secondResult) {
                  const same = bcrypt.compareSync(answer, secondResult.answer);
                  if (same) {
                    resolve(true);
                  } else {
                    // TODO: LOG ALL FALSE RESULTS; LOCK OUT AFTER 3 INCORRECT ATTEMPTS
                    resolve(false);
                  }
                } else {
                  reject('Could not find answer for this user / questionid combo');
                }
              });
          } else {
            // reject(); // seems reject() doesn't work well here, maybe reject() is only for when it actually fails
            reject('Could not find valid token');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  public static async getPWResetRecord(id: string) {
    return new Promise((resolve, reject) => {
      const pwreset = DbManager.db.ResetPW;
      pwreset
        .findAll({
          where: {
            token: id
          }
        })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async deletePWResetToken(id: string) {
    return new Promise((resolve, reject) => {
      const pwreset = DbManager.db.ResetPW;
      pwreset
        .destroy({
          where: {
            token: id
          }
        })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async enable2FA(sub: string) {
    // TODO: MAY WANT TO ADD A CHECK HERE TO PREVENT SOMEONE FROM OVERRIDING THE STORED SECRET
    // WHICH WOULD MAKE THE PERSON MORE OR LESS LOCKED OUT OF THEIR ACCOUNT SINCE THE SECRET
    // STORED IN AUTHENTICATOR IS WRONG NOW
    return new Promise((resolve, reject) => {
      TwoFactorAuthUtils.generateNewSecret()
        .then((secret) => {
          const users = DbManager.db.Users;
          users
            .findOne({
              where: {
                sub
              }
            })
            .then((user: any) => {
              if (user.enabled2fa == false) {
                users
                  .update(
                    {
                      enabled2fa: true,
                      secret2fa: secret
                    },
                    {
                      where: {
                        sub
                      }
                    }
                  )
                  .then((result) => {
                    resolve({
                      secret,
                      sub: user.sub,
                      email: user.email
                    });
                  })
                  .catch((error) => {
                    reject(error);
                  });
              } else {
                // 2fa is already enabled
              }
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }

  public static async disable2FA(sub: string) {
    return new Promise((resolve, reject) => {
      const user = DbManager.db.Users;
      user
        .update(
          {
            enabled2fa: false,
            secret2fa: null
          },
          {
            where: {
              sub
            }
          }
        )
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
