import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { Repository, DeepPartial, FindOneOptions, FindManyOptions } from 'typeorm';

export abstract class BaseProvider<T> {
  constructor(private readonly repo: Repository<T>) {}

  public async findOne(guidOrOptions?: LookupOneOptions<T>) {
    const lookupOpts = this._makeLookupOptions(guidOrOptions);

    return this.repo.findOne(lookupOpts);
  }

  public async find(guidOrOptions?: LookupManyOptions<T>) {
    const lookupOpts = this._makeLookupOptions(guidOrOptions);

    return this.repo.find(lookupOpts);
  }

  public async create(entity: DeepPartial<T>) {
    const e = this.repo.create(entity) as DeepPartial<T>;

    return this.repo.save(e);
  }

  public async save(entity: DeepPartial<T>) {
    return this.repo.save(entity);
  }

  /**
   * Updates and entity based on the lookup options with the provided entity.
   *
   *
   * @param {(string | FindOneOptions<T>)} guidOrFindOptions The guid string or `FindOneOptions` object to use to lookup the entity.
   * @param {DeepPartial<T>} entity The entity object values used to update/create an existing entity.
   * @param {boolean} [createIfNotFound] Defines if the entity should be created if it is not found. Defaults to `false`.
   * @return {*}
   * @memberof BaseProvider
   */
  public async update(guidOrOptions: LookupOneOptions<T>, entity: DeepPartial<T>, createIfNotFound?: boolean) {
    // To avoid a coercive update due to a difference in provided guid and entity guid, we remove the guid from the entity.
    // Guid will be inherited from the existing entity, if any
    delete entity['guid'];

    const lookupOpts = this._makeLookupOptions(guidOrOptions);

    const existing = await this.repo.findOne(lookupOpts);

    if (existing) {
      return this.repo.save({
        ...existing,
        ...entity
      });
    } else if (createIfNotFound) {
      const newEntity = this.repo.create(entity) as DeepPartial<T>;

      return this.repo.save(newEntity);
    } else {
      throw new NotFoundException();
    }
  }

  /**
   * Deletes an entity based on the default `guid` property.
   *
   * Optionally, you can pass a `FindOneOptions` object to specify lookup condition.
   */
  public async deleteEntity(guidOrOptions?: LookupOneOptions<T> | string) {
    const lookupOpts = this._makeLookupOptions(guidOrOptions);

    const entity = await this.repo.findOne(lookupOpts);

    if (entity) {
      return this.repo.remove(entity);
    } else {
      throw new InternalServerErrorException();
    }
  }

  private _makeLookupOptions(guidOrOptions?: LookupManyOptions<T> | LookupOneOptions<T>) {
    let lookupOpts: FindOneOptions<T> | FindManyOptions<T>;

    if (typeof guidOrOptions === 'string') {
      lookupOpts = {
        where: {
          guid: guidOrOptions
        }
      } as FindOneOptions<T> | FindManyOptions<T>;
    } else {
      lookupOpts = guidOrOptions;
    }

    return lookupOpts;
  }
}

export type LookupOneOptions<U> = string | FindOneOptions<U>;
export type LookupManyOptions<U> = string | FindManyOptions<U>;
