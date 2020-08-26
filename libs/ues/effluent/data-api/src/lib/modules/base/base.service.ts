import { Injectable } from '@nestjs/common';
import { BaseEntity, Repository, FindOneOptions, FindManyOptions, DeepPartial } from 'typeorm';

@Injectable()
export class BaseService<T extends BaseEntity> {
  constructor(public readonly repository: Repository<T>) {}

  public async createOne(entity: DeepPartial<T>) {
    return await this.repository.create(entity).save();
  }

  public async getOne(options: FindOneOptions) {
    return await this.repository.findOne(options);
  }

  public async getMany(options: FindManyOptions<T>) {
    return await this.repository.find(options);
  }

  public async getAll() {
    return await this.repository.find();
  }

  public async updateOne(find: FindManyOptions<T>, updates: DeepPartial<T>) {
    const record = await this.repository.findOne(find);

    Object.assign(record, updates);

    return await record.save();
  }

  public async deleteOne(options: FindManyOptions<T>) {
    const record = await this.repository.findOne(options);

    return await record.remove();
  }
}
