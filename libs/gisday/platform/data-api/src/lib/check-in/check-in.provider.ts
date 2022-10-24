import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CheckIn, Event } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class CheckInProvider extends BaseProvider<CheckIn> {
  constructor(
    @InjectRepository(CheckIn) private checkInRepo: Repository<CheckIn>,
    @InjectRepository(Event) private eventRepo: Repository<Event>
  ) {
    super(checkInRepo);
  }

  public async insertUserCheckin(eventGuid: string, accountGuid: string) {
    const event = await this.eventRepo.findOne({
      where: {
        guid: eventGuid
      }
    });

    if (event) {
      const _checkin: Partial<CheckIn> = {
        event: event,
        accountGuid: accountGuid
      };

      const checkin = this.checkInRepo.create(_checkin);

      return checkin.save();
    } else {
      throw new UnprocessableEntityException(null, 'Event could not be found');
    }
  }
}
