import { getConnection, EntitySchema } from "typeorm";

export type TypeORMEntities =
  | string
  | Function
  | (new () => unknown)
  | EntitySchema<unknown>;

export abstract class CommonService {

  public static async findUserByKey<T extends TypeORMEntities>(entity: T, key: string, value: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const op = {
        [key]: value
      };
      getConnection()
        .getRepository(entity)
        .createQueryBuilder("entity")
        .where(`entity.${key} = :${key}`, op)
        .getOne()
        .then((res: T) => {
          resolve(res);
        })
        .catch(err => {
          throw err;
        });
    });
  }

  async findAll<T extends TypeORMEntities>(
    entity: T,
    where?: {}
  ): Promise<any[]> {
    const connection = getConnection();

    return new Promise((resolve, reject) => {
      if (where) {
        connection
          .getRepository(entity)
          .find({
            where
          })
          .then(results => {
            return resolve(results);
          });
      } else {
        connection
          .getRepository(entity)
          .find()
          .then(results => {
            return resolve(results);
          });
      }
    });
  }

  async findOne<T extends TypeORMEntities>(entity: T, where: {}): Promise<any> {
    const connection = getConnection();

    return new Promise((resolve, reject) => {
      connection
        .getRepository(entity)
        .findOne(where)
        .then((result: T) => {
          return resolve(result);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  async insertAll<T extends TypeORMEntities>(
    entity: T,
    items: T[]
  ): Promise<any> {
    const connection = getConnection();

    return new Promise((resolve, reject) => {
      connection
        .getRepository(entity)
        .save(items)
        .then(result => {
          return resolve(result);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }
}
