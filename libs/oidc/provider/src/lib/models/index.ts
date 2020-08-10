import * as Sequelize from 'sequelize';
import { DbInterface } from '../typings/DbInterface';
import {
  AccountsFactory,
  AccountsTAMUFactory,
  SecretQuestionFactory,
  SecretAnswerFactory,
  ResetPWFactory
} from './Accounts/accounts';
import { RolesACFactory, UserRolesACFactory } from './Roles/roles';
import { SitesFactory } from './Sites/sites';
import { UsersFactory } from './Users/users';
import { UserLoginFactory } from './Logins/logins';
import {
  SessionFactory,
  AccessTokenFactory,
  AuthorizationCodeFactory,
  RefreshTokenFactory,
  DeviceCodeFactory,
  ClientCredentialsFactory,
  ClientsFactory,
  InitialAccessTokensFactory,
  RegistrationAccessTokensFactory
} from './Adaptor/adapter';

/**
 * Function used to create a connection to the database
 *
 * @param sequelizeConfig - The configuration (in JSON) used to establish the connection to the db
 * @returns A new DbInterface
 */
export const createModels = (sequelizeConfig): DbInterface => {
  const { database, username, password, dialect, storage, define } = sequelizeConfig.development;
  const sequelize = new Sequelize(database, username, password, {
    dialect: dialect,
    storage: storage,
    define: define,
    logging: false
  });

  const db: DbInterface = {
    sequelize,
    Sequelize,
    Accounts: AccountsFactory(sequelize, Sequelize),
    AccountsTAMU: AccountsTAMUFactory(sequelize, Sequelize),
    SecretQuestions: SecretQuestionFactory(sequelize, Sequelize),
    SecretAnswers: SecretAnswerFactory(sequelize, Sequelize),
    ResetPW: ResetPWFactory(sequelize, Sequelize),
    Users: UsersFactory(sequelize, Sequelize),
    UserLogins: UserLoginFactory(sequelize, Sequelize),
    Sessions: SessionFactory(sequelize, Sequelize),
    AccessTokens: AccessTokenFactory(sequelize, Sequelize),
    AuthorizationCodes: AuthorizationCodeFactory(sequelize, Sequelize),
    RefreshTokens: RefreshTokenFactory(sequelize, Sequelize),
    DeviceCodes: DeviceCodeFactory(sequelize, Sequelize),
    ClientCredentials: ClientCredentialsFactory(sequelize, Sequelize),
    Clients: ClientsFactory(sequelize, Sequelize),
    InitialAccessTokens: InitialAccessTokensFactory(sequelize, Sequelize),
    RegistrationAccessTokens: RegistrationAccessTokensFactory(sequelize, Sequelize),
    // Access Control
    RolesAC: RolesACFactory(sequelize, Sequelize),
    UserRolesAC: UserRolesACFactory(sequelize, Sequelize),
    Sites: SitesFactory(sequelize, Sequelize)
  };
  return db;
};
