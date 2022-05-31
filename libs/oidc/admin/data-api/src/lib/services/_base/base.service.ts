import { Injectable, UnprocessableEntityException } from '@nestjs/common';

import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class BaseService<T> {
  constructor(private readonly repo: Repository<T>) {}

  public getEntities() {
    return this.repo.find();
  }

  public getEntity(guid: string, relations?: string[]) {
    return this.repo.findOne({
      where: {
        guid: guid
      },
      relations: relations
    });
  }

  public async insertEntity(_entity: DeepPartial<T>) {
    const entity = this.repo.create(_entity);
    return this.repo.save(entity);
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
      throw new UnprocessableEntityException();
    }
  }
}
