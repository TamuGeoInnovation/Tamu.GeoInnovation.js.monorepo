import * as Sequelize from 'sequelize';
import {
  IAccountAttrs,
  IAccountsInstance,
  ITAMUAttrs,
  ITAMUInstance,
  ISecretQuestions,
  ISecretQuestionsInstance,
  ISecretAnswersInstance,
  ISecretAnswers,
  IResetPWAttrs,
  IResetPWInstance
} from '../../models/Accounts/accounts';
import { IRolesACAttrs, IRolesACInstance, IUserRolesACAttrs, IUserRolesACInstance } from '../../models/Roles/roles';
import { IUsersAttrs, IUsersInstance } from '../../models/Users/users';
import { ISiteAttrs, ISiteInstance } from '../../models/Sites/sites';
import { IUserLoginAttrs, IUserLoginInstance } from '../../models/Logins/logins';
import { IAdapterAttrs, IOIDCInstance } from '../../models/Adaptor/adapter';

/**
 * Interface that exposes our models to our Express routes and anywhere else in the server
 *
 * @interface DbInterface
 */
export interface DbInterface {
  /**
   * Property which contains the connected instance of Sequelize (the one instantiated with our connection configuration)
   *
   * @type {Sequelize.Sequelize}
   * @memberof DbInterface
   */
  sequelize: Sequelize.Sequelize;
  /**
   * Property containing a static reference Sequelize (not sure why this is required)
   *
   * @type {Sequelize.SequelizeStatic}
   * @memberof DbInterface 
   */
  Sequelize: Sequelize.SequelizeStatic;

  Users: Sequelize.Model<IUsersInstance, IUsersAttrs>;
  UserLogins: Sequelize.Model<IUserLoginInstance, IUserLoginAttrs>;
  Accounts: Sequelize.Model<IAccountsInstance, IAccountAttrs>;
  SecretQuestions: Sequelize.Model<ISecretQuestionsInstance, ISecretQuestions>;
  SecretAnswers: Sequelize.Model<ISecretAnswersInstance, ISecretAnswers>;
  ResetPW: Sequelize.Model<IResetPWInstance, IResetPWAttrs>;
  Sessions: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  AccessTokens: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  AuthorizationCodes: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  RefreshTokens: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  DeviceCodes: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  ClientCredentials: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  Clients: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  InitialAccessTokens: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  RegistrationAccessTokens: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;

  // Access Control
  RolesAC: Sequelize.Model<IRolesACInstance, IRolesACAttrs>;
  UserRolesAC: Sequelize.Model<IUserRolesACInstance, IUserRolesACAttrs>;
  Sites: Sequelize.Model<ISiteInstance, ISiteAttrs>;

  // SITE SPECIFIC
  AccountsTAMU: Sequelize.Model<ITAMUInstance, ITAMUAttrs>;
}
