import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Place } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class PlaceService extends BaseProvider<Place> {
  constructor(@InjectRepository(Place) private pRepo: Repository<Place>) {
    super(pRepo);
  }

  public getEntities() {
    try {
      return this.pRepo.find({
        order: {
          guid: 'ASC'
        }
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
