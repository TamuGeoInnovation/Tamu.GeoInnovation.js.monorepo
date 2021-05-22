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

export class DbManager {
  public static db: DbInterface;
  public static isConnected: () => boolean = () => {
    let result = false;
    DbManager.db.sequelize.authenticate().then(() => {
      result = true;
    });
    return result;
  };

  public static setup(): void {
    DbManager.db = createModels(sequelizeConfig);
    DbManager.db.sequelize.sync();
  }

  public static setupPromise(): Promise<any> {
    return new Promise((resolve, reject) => {
      DbManager.db = createModels(sequelizeConfig);
      DbManager.db.sequelize.sync().then((result) => {
        resolve();
      });
    });
  }

  public static sync() {
    return DbManager.db.sequelize.sync();
  }

  public static updateTokenExpirationDateTime() {}
}
