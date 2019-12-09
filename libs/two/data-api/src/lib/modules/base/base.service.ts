import { Injectable } from '@nestjs/common';
import { BaseEntity, FindManyOptions, Repository } from 'typeorm';

@Injectable()
export abstract class BaseService<Entity extends BaseEntity> {
  constructor(private r: Repository<Entity>) {}

  public async getAll() {
    return await this.r.find();
  }

  public async getMany(findOptions?: FindManyOptions<Entity>) {
    return await this.r.find(findOptions);
  }
}
