import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { isWithinPolygon, LatLon } from '@tamu-gisc/common/utils/geometry';
import {
  CHECK_IN_ZONE,
  CHECK_IN_ZONE_EVENT_MODE,
  CHECK_IN_ZONE_MARGIN,
  CHECK_IN_ZONE_MESSAGE
} from '@tamu-gisc/gisday/common';

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

  public async getCheckinsForUser(userGuid: string) {
    if (!userGuid) {
      throw new UnprocessableEntityException(null, 'User guid is missing');
    }

    return this.checkInRepo.find({
      where: {
        accountGuid: userGuid
      },
      relations: ['event']
    });
  }

  /**
   * Checks the attendee in. For an in-person event, `location` must be inside the check-in zone
   * (#1766); it is checked and not stored. Hybrid and virtual events need no location.
   */
  public async insertUserCheckin(eventGuid: string, accountGuid: string, location?: LatLon) {
    const existing = await this.checkInRepo.findOne({
      where: {
        event: { guid: eventGuid },
        accountGuid: accountGuid
      }
    });

    if (existing) {
      throw new UnprocessableEntityException(null, 'Check-in already exists');
    }

    const event = await this.eventRepo.findOne({
      where: {
        guid: eventGuid
      }
    });

    if (!event) {
      throw new UnprocessableEntityException(null, 'Event could not be found');
    }

    if (event.mode === CHECK_IN_ZONE_EVENT_MODE) {
      if (!isLocation(location)) {
        throw new ForbiddenException('Checking in to this event needs your location.');
      }

      if (!isWithinPolygon(location, CHECK_IN_ZONE, CHECK_IN_ZONE_MARGIN)) {
        throw new ForbiddenException(CHECK_IN_ZONE_MESSAGE);
      }
    }

    const checkin = this.checkInRepo.create({
      event: event,
      accountGuid: accountGuid
    });

    return checkin.save();
  }

  public async getUserCheckinForEvent(eventGuid: string, userGuid: string) {
    const checkin = await this.checkInRepo.findOne({
      where: {
        event: { guid: eventGuid },
        accountGuid: userGuid
      }
    });

    if (!checkin) {
      throw new NotFoundException('Check-in could not be found');
    }

    return checkin;
  }
}

/**
 * Whether a request body gave a usable latitude and longitude.
 */
function isLocation(location: LatLon): boolean {
  return (
    Number.isFinite(location?.latitude) &&
    Number.isFinite(location?.longitude) &&
    Math.abs(location.latitude) <= 90 &&
    Math.abs(location.longitude) <= 180
  );
}
