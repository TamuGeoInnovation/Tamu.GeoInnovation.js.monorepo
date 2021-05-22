import { getConnection, EntitySchema, FindConditions, BaseEntity } from 'typeorm';

export type TypeORMEntities = string | Function | (new () => unknown) | EntitySchema<unknown>;

export abstract class CommonService {
  public static async findByKey<T extends TypeORMEntities>(entity: T, key: string, value: string) {
    const op = {
      [key]: value
    };

    getConnection()
      .getRepository(entity)
      .createQueryBuilder('entity')
      .where(`entity.${key} = :${key}`, op)
      .getOne()
      .then((res: T) => {
        return res;
      })
      .catch((err) => {
        throw err;
      });
  }

  public static async findAll<T extends TypeORMEntities>(entity: T, where?: {}) {
    const connection = getConnection();

    if (where) {
      connection
        .getRepository(entity)
        .find({
          where
        })
        .then((results) => {
          return results;
        });
    } else {
      connection
        .getRepository(entity)
        .find()
        .then((results) => {
          return results;
        });
    }
  }

  public async findOne<T extends TypeORMEntities>(entity: T, where: {}) {
    const connection = getConnection();

    connection
      .getRepository(entity)
      .findOne(where)
      .then((result: T) => {
        return result;
      })
      .catch((err) => {
        return err;
      });
  }

  public async insertAll<T extends TypeORMEntities>(entity: T, items: T[]) {
    const connection = getConnection();

    connection
      .getRepository(entity)
      .save(items)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        return err;
      });
  }
}
