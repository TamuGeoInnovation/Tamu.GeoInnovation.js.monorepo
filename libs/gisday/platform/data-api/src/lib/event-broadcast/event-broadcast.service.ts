import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBroadcast } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class EventBroadcastService extends BaseProvider<EventBroadcast> {
  constructor(@InjectRepository(EventBroadcast) private elRepo: Repository<EventBroadcast>) {
    super(elRepo);
  }

  public getEntities() {
    try {
      return this.elRepo.find({
        order: {
          guid: 'ASC'
        }
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
