import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
    try {
      const event = await this.eventRepo.findOne({
        where: {
          guid: eventGuid
        }
      });

      const existingRsvp = await this.userRsvpRepo.findOne({
        where: {
          event: event,
          accountGuid: accountGuid
        }
      });

      if (existingRsvp) {
        throw new Error('RSVP already exists');
      }

      const newUserRsvp = this.userRsvpRepo.create({
        event: event,
        accountGuid: accountGuid
      });

      return this.userRsvpRepo.save(newUserRsvp);
    } catch (err) {
      throw new InternalServerErrorException(`Error creating RSVP. ${err}`);
    }
  }

  public async getUserRsvps(accountGuid: string) {
    return this.userRsvpRepo.find({
      where: {
        accountGuid: accountGuid
      },
      relations: ['event']
    });
  }

  public async deleteRsvpForUser(eventGuid: string, accountGuid: string) {
    const rsvp = await this.userRsvpRepo.findOne({
      where: {
        event: eventGuid,
        accountGuid: accountGuid
      }
    });

    if (!rsvp) {
      throw new NotFoundException();
    }

    return rsvp.remove();
  }
}
