import * as Sequelize from 'sequelize';

import { IAdapterAttrs, IOIDCInstance } from '../models/Adaptor/adapter';
import { DbInterface } from '../typings/DbInterface';
import { createModels } from '../models/index';

const sequelizeConfig = {
  development: {
    database: 'oidc',
    username: '',
    password: '',
    dialect: 'sqlite',
    storage: '../oidc.db',
    define: {
      timestamps: false
    }
  }
};

interface Models {
  [key: string]: Sequelize.Model<unknown, IAdapterAttrs>;
  Session: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  AccessToken: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  AuthorizationCode: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  RefreshToken: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  DeviceCode: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  ClientCredentials: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  Client: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  InitialAccessToken: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
  RegistrationAccessToken: Sequelize.Model<IOIDCInstance, IAdapterAttrs>;
}

export class SequelizeAdapter {
  public grantable: Set<string> = new Set(['AccessToken', 'AuthorizationCode', 'RefreshToken', 'DeviceCode']);
  private db: DbInterface;
  public name: string;
  public model: Sequelize.Model<any, IAdapterAttrs>;
  private models: Models;

  constructor(name: string) {
    this.db = createModels(sequelizeConfig);
    // this.db.sequelize.sync();
    this.models = {
      Session: this.db.Sessions,
      AccessToken: this.db.AccessTokens,
      AuthorizationCode: this.db.AuthorizationCodes,
      RefreshToken: this.db.RefreshTokens,
      DeviceCode: this.db.DeviceCodes,
      ClientCredentials: this.db.ClientCredentials,
      Client: this.db.Clients,
      InitialAccessToken: this.db.InitialAccessTokens,
      RegistrationAccessToken: this.db.RegistrationAccessTokens
    };
    this.model = this.models[name];
    this.name = name;
  }

  public async upsert(id: string, data: any, expiresIn: number) {
    const key = this.key(id);

    const { grantId, userCode } = data;
    if (grantId) {
      const grantKey = this.grantKeyFor(grantId);
    }

    const joe = {
      ...(data.grantId ? { grantId: data.grantId } : undefined)
    };

    await this.model
      .upsert({
        id: id,
        data: JSON.stringify(data),
        grantId: data.grantId ? data.grantId : undefined,
        userCode: data.userCode ? data.userCode : undefined,
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : 'null',
        consumedAt: new Date(Date.now()).toISOString()
      })
      .then((result) => {})
      .catch((error) => {
        console.error(error);
      });
  }

  public async find(id: string) {
    const key = this.key(id);
    return this.model.findByPk(id).then((found) => {
      if (!found) {
        return undefined;
      }
      return {
        ...JSON.parse(found.data)
      };
    });
  }

  public async findByUserCode(userCode: string) {
    return this.model
      .findOne({
        where: {
          userCode
        }
      })
      .then((found) => {
        if (!found) {
          return undefined;
        }
        return {
          ...found.data,
          ...(found.consumedAt
            ? {
                consumed: true
              }
            : undefined)
        };
      });
  }

  public async consume(id: string) {
    await this.model.update(
      {
        consumedAt: new Date(Date.now()).toISOString()
      },
      {
        where: {
          id
        }
      }
    );
  }

  public async destroy(id: string) {
    const key = this.key(id);
    if (this.grantable.has(this.name)) {
      const { grantId } = await this.model.findByPrimary(id);
      const promises: Sequelize.Model<any, IAdapterAttrs>[] = [];
      this.grantable.forEach((name) => {
        promises.push(this.models[name]);
      });
      promises.forEach((promise) => {
        promise
          .destroy({
            where: {
              grantId
            }
          })
          .then((result) => {})
          .catch((error) => {});
      });
    } else {
      await this.model.destroy({
        where: { id }
      });
    }
  }

  public async connect() {
    this.db.sequelize.sync();
  }

  private grantKeyFor(id: string) {
    return `grant:${id}`;
  }

  private key(id: string) {
    return `${this.name}:${id}`;
  }
}
