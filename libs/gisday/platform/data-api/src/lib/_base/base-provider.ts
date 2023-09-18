import { InternalServerErrorException } from '@nestjs/common';

import { Repository, DeepPartial, FindOneOptions, FindManyOptions } from 'typeorm';

export abstract class BaseProvider<T> {
  constructor(private readonly repo: Repository<T>) {}

  public async findOne(options?: FindOneOptions<T>) {
    return this.repo.findOne(options);
  }

  public async find(options?: FindManyOptions<T>) {
    return this.repo.find(options);
  }

  public async save(entity: DeepPartial<T>) {
    return this.repo.save(entity);
  }

  public async update(entity: DeepPartial<T>, options?: FindOneOptions<T>) {
    return this.repo.save(entity);
  }

  /**
   * Deletes an entity based on the default `guid` property.
   *
   * Optionally, you can pass a `FindOneOptions` object to specify lookup condition.
   */
  public async deleteEntity(guidOrOptions?: FindOneOptions<T> | string) {
    let lookupOpts: FindOneOptions<T>;

    if (typeof guidOrOptions === 'string') {
      lookupOpts = {
        where: {
          guid: guidOrOptions
        }
      } as FindOneOptions<T>;
    } else {
      lookupOpts = guidOrOptions;
    }

    const entity = await this.repo.findOne(lookupOpts);

    if (entity) {
      return this.repo.remove(entity);
    } else {
      throw new InternalServerErrorException();
    }
  }
}
