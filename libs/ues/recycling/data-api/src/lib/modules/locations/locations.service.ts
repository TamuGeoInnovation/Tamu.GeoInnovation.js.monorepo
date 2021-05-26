import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Location } from '@tamu-gisc/ues/recycling/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class LocationsService extends BaseService<Location> {
  constructor(@InjectRepository(Location) private repo: Repository<Location>) {
    super(repo);
  }

  public getLocations() {
    return this.repo.find({
      order: {
        id: 'ASC'
      }
    });
  }

  public getLocationAndResults() {
    return this.repo.find({
      order: {
        id: 'ASC'
      },
      relations: ['results']
    });
  }
}
