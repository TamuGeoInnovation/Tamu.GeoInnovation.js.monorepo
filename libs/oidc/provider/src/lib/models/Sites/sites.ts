import * as Sequelize from 'sequelize';

import { SequelizeAttributes } from '../../typings/SequelizeAttributes';

const MODEL_TABLE = 'sites';

export interface ISiteAccess {
  siteName: string;
  siteGuid: string;
  level: number;
  role: string;
  roleId: number;
  userGuid: string;
}

export interface ISiteAttrs {
  siteGuid: string;
  siteName: string;
}

export interface ISiteInstance extends Sequelize.Instance<ISiteAttrs>, ISiteAttrs {}

export const SitesFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<ISiteInstance, ISiteAttrs> => {
  const attributes: SequelizeAttributes<ISiteAttrs> = {
    siteGuid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    siteName: {
      type: DataTypes.STRING
    }
  };

  const Sites = sequelize.define<ISiteInstance, ISiteAttrs>(MODEL_TABLE, attributes);

  return Sites;
};
