import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CheckIn, CheckInRepo, EventRepo } from '../../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class CheckInProvider extends BaseProvider<CheckIn> {
  constructor(private readonly checkInRepo: CheckInRepo, private readonly eventRepo: EventRepo) {
    super(checkInRepo);
  }

  public async insertUserCheckin(req: Request) {
    if (req.user) {
      const eventGuid = req.body.eventGuid;
      const event = await this.eventRepo.findOne({
        where: {
          guid: eventGuid
        }
      });
      if (event) {
        const _checkin: Partial<CheckIn> = {
          event: event,
          accountGuid: req.user.sub
        };
        const checkin = this.checkInRepo.create(_checkin);
        checkin.save();
      }
    } else {
      return 'No user is found';
    }
  }
}
