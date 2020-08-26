import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Location } from '@tamu-gisc/ues/effluent/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class LocationsService extends BaseService<Location> {
  constructor(@InjectRepository(Location) private repo: Repository<Location>) {
    super(repo);
  }
}
