import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProFluxExpanded } from '@tamu-gisc/two/common';

import { DataService } from '../data/data.service';

@Injectable()
export class ProFluxService extends DataService<ProFluxExpanded> {
  constructor(@InjectRepository(ProFluxExpanded) private r: Repository<ProFluxExpanded>) {
    super(r);
  }
}
