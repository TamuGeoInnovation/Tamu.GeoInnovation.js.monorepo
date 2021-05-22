import { v4 as guid } from 'uuid';

import { DbManager } from '../sequelize/DbManager';
import { AccountManager } from '../sequelize/account_manager';

const store = new Map();
const logins = new Map();

export class OIDCAccount {
  constructor(id?: string) {
    this.accountId = id || guid();
    store.set(this.accountId, this);
  }
  private accountId: string;

  public static async findByLogin(loginEmail: string) {
    // FIXME:Is it wise to have this DbManager.setup() in this constructor?
    if (!DbManager.db) {
      DbManager.setup();
    }
    return new Promise((resolve, reject) => {
      DbManager.db.Users.find({
        where: {
          email: loginEmail
        }
      })
        .then((account) => {
          if (!account) {
            // The user does not have an account; redirect to sign up page
            // AccountManager.db.Users.upsert({
            //   sub: "newSUb",
            //   email: loginEmail,
            //   password: "idk",
            // }).then(result => {
            // })
          }
          resolve({
            account
          });
        })
        .catch((error) => {});
    });
  }

  // TODO: I DONT THINK THIS IS USED CURRENTLY; INSTEAD WE USE THE ONE DEFINED IN THE OIDC CONFIGURATION
  public static async findById(ctx, id, token) {
    const user = await AccountManager.getAccountClaims(id);
    if (!DbManager.db) {
      DbManager.setup();
    }
    return new Promise((resolve, reject) => {
      DbManager.db.Users.find({
        where: {
          sub: id
        }
      })
        .then((account) => {
          if (!account) {
            // insert a new account?
          }
          resolve({
            account
          });
        })
        .catch((error) => {});
    });
  }

  // TODO: I DONT THINK THIS IS EVER GOING TO BE USED AS SEEN HERE
  /**
   * @param use - can either be "id_token" or "userinfo", depending on
   *   where the specific claims are intended to be put in.
   * @param scope - the intended scope, while oidc-provider will mask
   *   claims depending on the scope automatically you might want to skip
   *   loading some claims from external resources etc. based on this detail
   *   or not return them in id tokens but only userinfo and so on.
   */
  public async claims(use, scope) {
    // eslint-disable-line no-unused-vars
    return {
      sub: this.accountId, // it is essential to always return a sub claim

      address: {
        country: '000',
        formatted: '000',
        locality: '000',
        postal_code: '000',
        region: '000',
        street_address: '000'
      },
      birthdate: '1987-10-16',
      email: 'johndoe@example.com',
      email_verified: false,
      family_name: 'Doe',
      gender: 'male',
      given_name: 'John',
      locale: 'en-US',
      middle_name: 'Middle',
      name: 'John Doe',
      nickname: 'Johny',
      phone_number: '+49 000 000000',
      phone_number_verified: false,
      picture: 'http://lorempixel.com/400/200/',
      preferred_username: 'Jdawg',
      profile: 'https://johnswebsite.com',
      updated_at: 1454704946,
      website: 'http://example.com',
      zoneinfo: 'Europe/Berlin'
    };
  }

  // static async findByLogin(login: string) {
  //   if (!logins.get(login)) {
  //     logins.set(login, new NewAccount());
  //   }

  //   return logins.get(login);
  // }

  // static async findById(ctx: any, id: any, token: any) { // eslint-disable-line no-unused-vars
  //   // token is a reference to the token used for which a given account is being loaded,
  //   //   it is undefined in scenarios where account claims are returned from authorization endpoint
  //   // ctx is the koa request context
  //   if (!store.get(id)) new NewAccount(id); // eslint-disable-line no-new
  //   return store.get(id);
  // }
}
