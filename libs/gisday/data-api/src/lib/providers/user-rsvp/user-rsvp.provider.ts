import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { UserRsvp, UserRsvpRepo, EventRepo, RsvpTypeRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Injectable()
export class UserRsvpProvider extends BaseProvider<UserRsvp> {
  constructor(
    public readonly userRsvpRepo: UserRsvpRepo,
    private readonly eventRepo: EventRepo,
    private readonly rsvpTypeRepo: RsvpTypeRepo
  ) {
    super(userRsvpRepo);
  }

  async insertUserRsvp(req: Request) {
    const { eventGuid, rsvpTypeGuid, userGuid } = req.body;
    const _rsvpType = await this.rsvpTypeRepo.findOne({
      where: {
        guid: rsvpTypeGuid
      }
    });
    const _event = await this.eventRepo.findOne({
      where: {
        guid: eventGuid
      }
    });
    const _newUserRsvp: Partial<UserRsvp> = {
      event: _event,
      rsvpType: _rsvpType,
      accountGuid: userGuid
    };
    const newUserRsvp = await this.userRsvpRepo.create(_newUserRsvp);
    return this.userRsvpRepo.save(newUserRsvp);
  }

  async getUserRsvps(guid: string) {
    return this.userRsvpRepo.getUserRsvps(guid);
  }
}
