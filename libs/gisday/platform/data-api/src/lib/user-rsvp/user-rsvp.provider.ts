import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserRsvp, Event, RsvpType } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class UserRsvpProvider extends BaseProvider<UserRsvp> {
  constructor(
    @InjectRepository(UserRsvp) public userRsvpRepo: Repository<UserRsvp>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(RsvpType) private readonly rsvpTypeRepo: Repository<RsvpType>
  ) {
    super(userRsvpRepo);
  }

  public async insertUserRsvp(eventGuid: string, rsvpTypeGuid: string, accountGuid: string) {
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
      accountGuid: accountGuid
    };

    const newUserRsvp = this.userRsvpRepo.create(_newUserRsvp);

    return this.userRsvpRepo.save(newUserRsvp);
  }

  public async getUserRsvps(accountGuid: string) {
    return this.userRsvpRepo.find({
      where: {
        accountGuid: accountGuid
      },
      relations: ['event', 'rsvpType']
    });
  }
}