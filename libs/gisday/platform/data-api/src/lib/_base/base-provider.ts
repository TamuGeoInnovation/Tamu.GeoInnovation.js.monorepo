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

  public async save(_entity: DeepPartial<T>) {
    return this.repo.save(_entity);
  }

  // public async update(_entity: DeepPartial<T>, entityName: string) {
  //   const entity = await this.repo.findOne({
  //     where: {
  //       guid: _entity['guid']
  //     },
  //     relations: EntityRelationsLUT.getRelation(entityName)
  //   });
  //   if (entity) {
  //     const merged = deepmerge<DeepPartial<T>>(entity, _entity);
  //     return this.repo.save(merged);
  //   } else {
  //     this.save(_entity);
  //   }
  // }

  public async update(_entity: DeepPartial<T>, options: FindOneOptions<T>) {
    return;
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
    }

    const entity = await this.repo.findOne(lookupOpts);

    if (entity) {
      return this.repo.remove(entity);
    } else {
      throw new InternalServerErrorException();
    }
  }
}
