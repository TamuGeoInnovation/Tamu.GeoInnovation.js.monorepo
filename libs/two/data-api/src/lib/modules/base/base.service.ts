import { BaseEntity, FindManyOptions, Repository } from 'typeorm';

export abstract class BaseService<Entity extends BaseEntity> {
  constructor(private r: Repository<Entity>) {}

  public async getAll() {
    console.log('getting all');
    return await this.r.find();
  }

  public async getMany(findOptions?: FindManyOptions) {
    console.log('getting many');
    return await this.r.find(findOptions);
  }
}
