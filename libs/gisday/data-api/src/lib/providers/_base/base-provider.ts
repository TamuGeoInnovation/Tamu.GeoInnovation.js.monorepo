import { DeepPartial } from 'typeorm';
import { Request } from 'express';
import * as deepmerge from 'deepmerge';

import { CommonRepo } from '../../entities/all.entity';

export abstract class BaseProvider<T> implements IBaseProvider<T> {
  constructor(private readonly repo: CommonRepo<T>) {}

  async getEntity(guid: string) {
    return this.repo.findOne({
      where: {
        guid: guid
      }
    });
  }

  async getEntities() {
    return this.repo.find();
  }

  async insertEntity(req: Request) {
    const _entity: DeepPartial<T> = req.body;
    const entity = this.repo.create(_entity);
    return this.repo.save(entity);
  }

  async updateEntity(req: Request) {
    const entity = await this.repo.findOne({
      where: {
        guid: req.body.guid
      }
    });
    if (entity) {
      const merged = deepmerge(entity as Partial<T>, req.body);
      return this.repo.save(merged);
    } else {
      throw new Error('Could not find entity to update');
    }
  }

  async deleteEntity(guid: string) {
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
