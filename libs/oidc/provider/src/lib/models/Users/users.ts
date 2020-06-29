import * as Sequelize from 'sequelize';

import { SequelizeAttributes } from '../../typings/SequelizeAttributes';

const MODEL_TABLE = 'users';

export interface IUsersAttrs {
  sub: string;
  email: string;
  password: string;
  updatedAt: string;
  enabled2fa: boolean;
  secret2fa: string | null;
}

export interface IUsersInstance extends Sequelize.Instance<IUsersAttrs>, IUsersAttrs {}

export const UsersFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IUsersInstance, IUsersAttrs> => {
  const attributes: SequelizeAttributes<IUsersAttrs> = {
    sub: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    updatedAt: {
      type: DataTypes.STRING
    },
    enabled2fa: {
      type: DataTypes.INTEGER
    },
    secret2fa: {
      type: DataTypes.STRING
    }
  };

  const Users = sequelize.define<IUsersInstance, IUsersAttrs>(MODEL_TABLE, attributes);

  return Users;
};
