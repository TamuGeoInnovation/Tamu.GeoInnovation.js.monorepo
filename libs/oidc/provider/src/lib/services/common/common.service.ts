import { getConnection, EntitySchema, FindConditions } from 'typeorm';

export type TypeORMEntities = string | (new () => unknown) | EntitySchema<unknown>;

export abstract class CommonService {
  // TODO: Is this even used anymore? Everything looks very shitty - Aaron H (4/21/22)
  public static async findByKey<T extends TypeORMEntities>(entity: T, key: string, value: string) {
    return new Promise((resolve, reject) => {
      const op = {
        [key]: value
      };
      getConnection()
        .getRepository(entity)
        .createQueryBuilder('entity')
        .where(`entity.${key} = :${key}`, op)
        .getOne()
        .then((res: T) => {
          resolve(res);
        })
        .catch((err) => {
          throw err;
        });
    });
  }

  public static async findAll<T extends TypeORMEntities>(entity: T, where?: FindConditions<T>) {
    const connection = getConnection();

    return new Promise((resolve, reject) => {
      if (where) {
        connection
          .getRepository(entity)
          .find({
            where
          })
          .then((results) => {
            return resolve(results);
          });
      } else {
        connection
          .getRepository(entity)
          .find()
          .then((results) => {
            return resolve(results);
          });
      }
    });
  }

  public async findOne<T extends TypeORMEntities>(entity: T, where: FindConditions<T>) {
    const connection = getConnection();

    return new Promise((resolve, reject) => {
      connection
        .getRepository(entity)
        .findOne(where)
        .then((result: T) => {
          return resolve(result);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  public async insertAll<T extends TypeORMEntities>(entity: T, items: T[]) {
    const connection = getConnection();

    return new Promise((resolve, reject) => {
      connection
        .getRepository(entity)
        .save(items)
        .then((result) => {
          return resolve(result);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
}
