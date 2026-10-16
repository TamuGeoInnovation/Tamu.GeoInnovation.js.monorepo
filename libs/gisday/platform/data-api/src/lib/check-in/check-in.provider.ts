import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { isLatLon, isLatLonPolygon, isWithinPolygon, LatLon } from '@tamu-gisc/common/utils/geometry';
import { CHECK_IN_MAX_ACCURACY, CHECK_IN_ZONE_EVENT_MODE, checkInZoneMessage } from '@tamu-gisc/gisday/common';

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
   * Checks the attendee in. For an in-person event whose location has a check-in zone, `position`
   * must reach it (#1766): inside it, or with its accuracy circle touching it, the accuracy capped
   * at `CHECK_IN_MAX_ACCURACY`. Anything else is refused; organizers add exceptions from the admin
   * page. The position is checked and not stored. Hybrid and virtual events, and locations with no
   * zone, need no position.
   *
   * The position is whatever the browser sends, so a made-up one cannot be told from a real one.
   * This stops checking in from home, not deliberate spoofing.
   */
  public async insertUserCheckin(eventGuid: string, accountGuid: string, position?: LatLon & { accuracy?: number }) {
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
      },
      relations: ['location']
    });

    if (!event) {
      throw new UnprocessableEntityException(null, 'Event could not be found');
    }

    const zone = event.location?.checkInZone;

    if (event.mode === CHECK_IN_ZONE_EVENT_MODE && isLatLonPolygon(zone)) {
      if (!isLatLon(position)) {
        throw new ForbiddenException('Checking in to this event needs your location.');
      }

      if (!isWithinPolygon(position, zone, reach(position.accuracy))) {
        throw new ForbiddenException(checkInZoneMessage(event.location.building));
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
 * How far outside the zone a position may be and still reach it: its reported accuracy, capped at
 * `CHECK_IN_MAX_ACCURACY`. A missing or nonsense accuracy counts as exact.
 */
function reach(accuracy: unknown): number {
  return typeof accuracy === 'number' && accuracy > 0 ? Math.min(accuracy, CHECK_IN_MAX_ACCURACY) : 0;
}
