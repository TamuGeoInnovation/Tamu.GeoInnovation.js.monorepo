import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';

import { WeatherFlux } from '@tamu-gisc/two/common';

@Injectable()
export class DataService {
  constructor(@InjectRepository(WeatherFlux) private repo: Repository<WeatherFlux>) {}

  public getData(options?: FindManyOptions) {
    return this.repo.findOne();
  }
}
