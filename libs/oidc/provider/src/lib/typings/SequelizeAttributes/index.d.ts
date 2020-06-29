import { DataTypeAbstract, DefineAttributeColumnOptions } from 'sequelize';
import Tedious, { TediousTypes, TediousType } from 'tedious';

type SequelizeAttribute = string | DataTypeAbstract | DefineAttributeColumnOptions;

/**
 * Type used to declare our Sequelize model attributes
 */
export type SequelizeAttributes<T extends { [key: string]: any }> = {
  [P in keyof T]: SequelizeAttribute;
};
