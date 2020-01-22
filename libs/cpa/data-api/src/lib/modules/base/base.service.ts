import { Injectable } from '@nestjs/common';
import { BaseEntity, Repository, FindManyOptions } from 'typeorm';

@Injectable()
export class BaseService<T extends BaseEntity> {
  constructor(private r: Repository<T>) {}

  public async getAll() {
    return await this.r.find();
  }

  public async getMany(options: FindManyOptions<T>) {
    return await this.r.find(options);
  }
}
