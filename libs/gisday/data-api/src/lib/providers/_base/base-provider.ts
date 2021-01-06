import { DeepPartial } from 'typeorm';

import { Request } from 'express';
import * as deepmerge from 'deepmerge';

import { CommonRepo } from '../../entities/all.entity';

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

  public async insertEntity(req: Request) {
    if (req.user) {
      req.body.accountGuid = req.user.sub;
    }
    const _entity: DeepPartial<T> = req.body;
    const entity = this.repo.create(_entity);
    return this.repo.save(entity);
  }

  public async updateEntity(req: Request) {
    const entity = await this.repo.findOne({
      where: {
        guid: req.body.guid
      }
    });
    if (entity) {
      const merged = deepmerge(entity as Partial<T>, req.body);
      return this.repo.save(merged);
    } else {
      if (req.user) {
        req.body.accountGuid = req.user.sub;
      }
      this.insertEntity(req);
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
  getEntity(guid: string): Promise<T>;
  getEntities(): Promise<T[]>;
  insertEntity(req: Request): Promise<T>;
  updateEntity(req: Request): Promise<T>;
  deleteEntity(guid: string): Promise<T>;
}
