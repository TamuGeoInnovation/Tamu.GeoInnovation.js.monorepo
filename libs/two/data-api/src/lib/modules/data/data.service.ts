import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';

import { WeatherfluxExpanded } from '@tamu-gisc/two/common';

@Injectable()
export class DataService {
  constructor(@InjectRepository(WeatherfluxExpanded) private repo: Repository<WeatherfluxExpanded>) {}

  public getData(options?: FindManyOptions) {
    return this.repo.find(options);
  }
}
