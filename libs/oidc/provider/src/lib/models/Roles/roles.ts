import * as Sequelize from 'sequelize';

import { SequelizeAttributes } from '../../typings/SequelizeAttributes';

const ROLES_TABLE = 'access_control_roles';
const USER_ROLES_TABLE = 'access_control_user_roles';

export interface IRolesACAttrs {
  id?: number;
  level: number;
  name: string;
}

export interface IRolesACInstance extends Sequelize.Instance<IRolesACAttrs>, IRolesACAttrs {}

export const RolesACFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IRolesACInstance, IRolesACAttrs> => {
  const attributes: SequelizeAttributes<IRolesACAttrs> = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    level: {
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING
    }
  };

  const RolesAC = sequelize.define<IRolesACInstance, IRolesACAttrs>(ROLES_TABLE, attributes);

  return RolesAC;
};

export interface IUserRolesACAttrs {
  // id: number;
  siteGuid: string;
  roleId: number;
  userId?: string;
  userGuid: string;
}

export interface IUserRolesACInstance extends Sequelize.Instance<IUserRolesACAttrs>, IUserRolesACAttrs {}

export const UserRolesACFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IUserRolesACInstance, IUserRolesACAttrs> => {
  const attributes: SequelizeAttributes<IUserRolesACAttrs> = {
    // id: {
    //   primaryKey: true,
    //   type: DataTypes.INTEGER,
    // },
    siteGuid: {
      type: DataTypes.STRING
    },
    roleId: {
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.STRING
    },
    userGuid: {
      type: DataTypes.STRING
    }
  };

  const UserRolesAC = sequelize.define<IUserRolesACInstance, IUserRolesACAttrs>(USER_ROLES_TABLE, attributes);

  return UserRolesAC;
};
