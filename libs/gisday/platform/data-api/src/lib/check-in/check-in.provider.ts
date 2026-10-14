import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { isLatLon, isLatLonPolygon, isWithinPolygon, LatLon } from '@tamu-gisc/common/utils/geometry';
import {
  CHECK_IN_ZONE_EVENT_MODE,
  CHECK_IN_ZONE_MARGIN,
  CheckInZoneRefusal,
  CheckInZoneStatus,
  checkInWindow,
  checkInZoneMessage,
  formatCheckInTime
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
   * Checks the attendee in. For an in-person event whose location has a check-in zone, `location`
   * must be inside it (#1766); it is checked and not stored. Hybrid and virtual events, and
   * locations with no zone, need no location.
   *
   * Any event accepts a check-in only from its start until 15 minutes after its end, as its page
   * shows the button, so nobody checks in early by calling the API.
   *
   * @param confirmOutsideZone The attendee was told they are outside the zone, or gave no location,
   * and chose to check in anyway. The check-in is saved with the matching `zoneStatus`.
   */
  public async insertUserCheckin(
    eventGuid: string,
    accountGuid: string,
    location?: LatLon,
    confirmOutsideZone?: boolean
  ) {
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
      relations: ['location', 'day']
    });

    if (!event) {
      throw new UnprocessableEntityException(null, 'Event could not be found');
    }

    const checkInTimes = checkInWindow(event.day?.date, event.startTime, event.endTime);
    const now = new Date();

    if (checkInTimes && now < checkInTimes.opens) {
      throw new ForbiddenException(`Check-in for this event opens when it starts, at ${formatCheckInTime(checkInTimes.opens)}.`);
    }

    if (checkInTimes && now > checkInTimes.closes) {
      throw new ForbiddenException('Check-in for this event has closed.');
    }

    const zone = event.location?.checkInZone;
    let zoneStatus: CheckInZoneStatus = null;

    if (event.mode === CHECK_IN_ZONE_EVENT_MODE && isLatLonPolygon(zone)) {
      const hasLocation = isLatLon(location);

      if (hasLocation && isWithinPolygon(location, zone, CHECK_IN_ZONE_MARGIN)) {
        zoneStatus = CheckInZoneStatus.InZone;
      } else {
        if (confirmOutsideZone !== true) {
          throw new ForbiddenException({
            statusCode: 403,
            error: 'Forbidden',
            reason: hasLocation ? CheckInZoneRefusal.OutsideZone : CheckInZoneRefusal.NoLocation,
            message: hasLocation
              ? checkInZoneMessage(event.location.building)
              : 'Checking in to this event needs your location.'
          });
        }

        zoneStatus = hasLocation ? CheckInZoneStatus.OutsideZone : CheckInZoneStatus.LocationBlocked;
      }
    }

    const checkin = this.checkInRepo.create({
      event: event,
      accountGuid: accountGuid,
      zoneStatus: zoneStatus
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
