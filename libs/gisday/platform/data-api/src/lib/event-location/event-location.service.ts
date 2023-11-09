import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventLocation } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class EventLocationService extends BaseProvider<EventLocation> {
  constructor(@InjectRepository(EventLocation) private esRepo: Repository<EventLocation>) {
    super(esRepo);
  }

  public getEntities() {
    try {
      return this.esRepo
        .createQueryBuilder('event-location')
        .leftJoinAndSelect('event-location.place', 'organization')
        .orderBy('event-location.building', 'ASC')
        .addOrderBy('organization.name', 'ASC')
        .getMany();
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
