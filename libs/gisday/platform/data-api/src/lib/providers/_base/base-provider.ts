import { InternalServerErrorException } from '@nestjs/common';

import { DeepPartial } from 'typeorm';
import * as deepmerge from 'deepmerge';

import { CommonRepo, EntityName, EntityRelationsLUT } from '../../entities/all.entity';

export abstract class BaseProvider<T> {
  constructor(private readonly repo: CommonRepo<T>, entityName?: EntityName) {}

  public async getEntity(guid: string) {
    return this.repo.findOne({
      where: {
        guid: guid
      }
    });
  }

  public async getEntitiesWithRelations(entityName: EntityName) {
    return this.repo.find({
      relations: EntityRelationsLUT.getRelation(entityName)
    });
  }

  public async getEntityWithRelations(guid: string, entityName: EntityName) {
    return this.repo.findOne({
      where: {
        guid: guid
      },
      relations: EntityRelationsLUT.getRelation(entityName)
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

  public async updateEntity(_entity: DeepPartial<T>, entityName: string) {
    const entity = await this.repo.findOne({
      where: {
        guid: _entity['guid']
      },
      relations: EntityRelationsLUT.getRelation(entityName)
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
      throw new InternalServerErrorException();
    }
  }
}
