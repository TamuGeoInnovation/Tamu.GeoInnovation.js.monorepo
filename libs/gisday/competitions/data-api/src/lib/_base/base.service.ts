import { Injectable } from '@nestjs/common';
import { BaseEntity, Repository, FindManyOptions, DeepPartial, FindOneOptions } from 'typeorm';

@Injectable()
export class BaseService<T extends BaseEntity> {
  constructor(public readonly repository: Repository<T>) {}

  public async getAll() {
    return await this.repository.find();
  }

  public async getOne(options: FindOneOptions<T>) {
    return await this.repository.findOne(options);
  }

  public async getMany(options: FindManyOptions<T>) {
    return await this.repository.find(options);
  }

  public async createOne(entity: DeepPartial<T>) {
    return await this.repository.create(entity).save();
  }
}
