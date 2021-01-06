import { Injectable } from '@nestjs/common';

import { CheckIn, CheckInRepo, EventRepo } from '../../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class CheckInProvider extends BaseProvider<CheckIn> {
  constructor(private readonly checkInRepo: CheckInRepo, private readonly eventRepo: EventRepo) {
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
      checkin.save();
    }
  }
}
