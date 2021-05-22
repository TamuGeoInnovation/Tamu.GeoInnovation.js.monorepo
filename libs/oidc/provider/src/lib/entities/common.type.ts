import { EntitySchema } from 'typeorm';

export type TypeORMEntities = string | Function | (new () => unknown) | EntitySchema<unknown>;
export type KindOfId = number | string;
