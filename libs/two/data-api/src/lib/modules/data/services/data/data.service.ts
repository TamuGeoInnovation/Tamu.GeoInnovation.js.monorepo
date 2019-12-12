import { Injectable } from '@nestjs/common';
import { Repository, FindManyOptions } from 'typeorm';

@Injectable()
export abstract class DataService<T> {
  constructor(private repo: Repository<T>) {}

  public getData(options?: FindManyOptions<T>) {
    return this.repo.find(options);
  }
}
