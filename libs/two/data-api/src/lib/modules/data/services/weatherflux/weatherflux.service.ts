import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WeatherfluxExpanded } from '@tamu-gisc/two/common';

import { DataService } from '../data/data.service';

@Injectable()
export class WeatherfluxService extends DataService<WeatherfluxExpanded> {
  constructor(@InjectRepository(WeatherfluxExpanded) private r: Repository<WeatherfluxExpanded>) {
    super(r);
  }
}
