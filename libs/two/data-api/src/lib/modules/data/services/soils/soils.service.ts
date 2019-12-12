import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SoilsExpanded } from '@tamu-gisc/two/common';

import { DataService } from '../data/data.service';

@Injectable()
export class SoilsService extends DataService<SoilsExpanded> {
  constructor(@InjectRepository(SoilsExpanded) private r: Repository<SoilsExpanded>) {
    super(r);
  }
}
