import * as Sequelize from 'sequelize';

import { SequelizeAttributes } from '../../typings/SequelizeAttributes';

const LOGINS_TABLE = 'user_logins';

export interface IUserLoginAttrs {
  sub?: string;
  grant_id?: string;
  email_used: string;
  used_ip_addr: string;
  occuredAt: string;
}

export interface IUserLoginInstance extends Sequelize.Instance<IUserLoginAttrs>, IUserLoginAttrs {}

export const UserLoginFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IUserLoginInstance, IUserLoginAttrs> => {
  const attributes: SequelizeAttributes<IUserLoginAttrs> = {
    sub: {
      type: DataTypes.STRING
    },
    grant_id: {
      type: DataTypes.STRING
    },
    email_used: {
      type: DataTypes.STRING
    },
    used_ip_addr: {
      type: DataTypes.STRING
    },
    occuredAt: {
      type: DataTypes.STRING
    }
  };

  const UserLogins = sequelize.define<IUserLoginInstance, IUserLoginAttrs>(LOGINS_TABLE, attributes);
  return UserLogins;
};
