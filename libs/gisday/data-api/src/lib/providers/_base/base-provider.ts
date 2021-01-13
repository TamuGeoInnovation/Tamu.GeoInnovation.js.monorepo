import { DeepPartial } from 'typeorm';

import { Request } from 'express';
import * as deepmerge from 'deepmerge';

import { CommonRepo, GuidIdentity } from '../../entities/all.entity';

export abstract class BaseProvider<T> implements IBaseProvider<T> {
  constructor(private readonly repo: CommonRepo<T>) {}

  public async getEntity(guid: string) {
    return this.repo.findOne({
      where: {
        guid: guid
      }
    });
  }

  public async getEntities() {
    return this.repo.find();
  }

  public async getEntitiesForUser(accountGuid: string) {
    return this.repo.find({
      where: {
        accountGuid: accountGuid
      }
    });
  }

  public async insertEntity(_entity: DeepPartial<T>) {
    const entity = this.repo.create(_entity);
    return this.repo.save(entity);
  }

  public async updateEntity(_entity: DeepPartial<T>) {
    const entity = await this.repo.findOne({
      where: {
        guid: _entity
      }
    });
    if (entity) {
      const merged = deepmerge<DeepPartial<T>>(entity, _entity);
      return this.repo.save(merged);
    } else {
      this.insertEntity(_entity);
    }
  }

  public async deleteEntity(guid: string) {
    const entity = await this.repo.findOne({
      where: {
        guid: guid
      }
    });
    if (entity) {
      return this.repo.remove(entity);
    } else {
      throw new Error('Could not find entity to delete');
    }
  }
}

export interface IBaseProvider<T> {
  getEntity(guid: string);
  getEntities();
  insertEntity(req: DeepPartial<T>);
  updateEntity(req: DeepPartial<T>);
  deleteEntity(guid: string);
}
