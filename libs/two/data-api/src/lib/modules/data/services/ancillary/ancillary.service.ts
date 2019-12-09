import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AncillaryExpanded } from '@tamu-gisc/two/common';

import { DataService } from '../data/data.service';

@Injectable()
export class AncillaryService extends DataService<AncillaryExpanded> {
  constructor(@InjectRepository(AncillaryExpanded) private r: Repository<AncillaryExpanded>) {
    super(r);
  }
}
