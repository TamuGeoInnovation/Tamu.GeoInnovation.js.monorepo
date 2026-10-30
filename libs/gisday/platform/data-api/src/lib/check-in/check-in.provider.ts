import { randomBytes, timingSafeEqual } from 'crypto';

import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { isLatLon, isLatLonPolygon, isWithinPolygon, LatLon } from '@tamu-gisc/common/utils/geometry';
import {
  CHECK_IN_CODE_MESSAGE,
  CHECK_IN_MAX_ACCURACY,
  CHECK_IN_ZONE_EVENT_MODE,
  checkInWindow,
  checkInZoneMessage,
  checksInByCode
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
      relations: { event: true }
    });
  }

  /**
   * Checks in the signed-in attendee. For an in-person event whose location has a check-in zone,
   * `position` must reach it (#1766): inside it, or with its accuracy circle touching it, the
   * accuracy capped at `CHECK_IN_MAX_ACCURACY`. Anything else is refused; organizers add exceptions
   * with `insertAttendeeCheckin`. The position is checked and not stored. Locations with no zone
   * need no position.
   *
   * The position is whatever the browser sends, so a made-up one cannot be told from a real one.
   * This stops checking in from home, not deliberate spoofing.
   *
   * A hybrid or virtual event needs no position but its QR code's `code` (#2560), the one
   * `getCheckInCode` gives organizers to show on a slide.
   */
  public insertUserCheckin(
    eventGuid: string,
    accountGuid: string,
    position?: LatLon & { accuracy?: number },
    code?: string
  ) {
    return this.insert(eventGuid, accountGuid, async (event) => {
      // Only while the session page shows the button, the same rule (#1795), so nobody checks in early
      // or late by calling the API directly. Checked before the location or the code, so an early
      // attendee is told when rather than how.
      assertCheckInOpen(event);

      if (checksInByCode(event.mode)) {
        // Not selected with the event, so it is asked for on its own.
        const stored = await this.eventRepo.findOne({
          where: { guid: event.guid },
          select: { guid: true, checkInCode: true }
        });

        if (!sameCode(code, stored?.checkInCode)) {
          throw new ForbiddenException(CHECK_IN_CODE_MESSAGE);
        }

        return;
      }

      const zone = event.location?.checkInZone;

      if (event.mode !== CHECK_IN_ZONE_EVENT_MODE || !isLatLonPolygon(zone)) {
        return;
      }

      if (!isLatLon(position)) {
        throw new ForbiddenException('Checking in to this event needs your location.');
      }

      if (!isWithinPolygon(position, zone, reach(position.accuracy))) {
        throw new ForbiddenException(checkInZoneMessage(event.location.building));
      }
    });
  }

  /**
   * Checks in an attendee an organizer names (#1767), with no location and no zone check: this is
   * how organizers add the exceptions the zone refuses (#1766).
   */
  public insertAttendeeCheckin(eventGuid: string, accountGuid: string) {
    return this.insert(eventGuid, accountGuid);
  }

  /**
   * The code in a hybrid or virtual session's check-in QR code (#2560), for an organizer to show on a
   * slide. Made the first time it is asked for and the same ever after, so a slide made early still
   * works. Two organizers asking at once get the same code: only the first write lands.
   */
  public async getCheckInCode(eventGuid: string): Promise<{ code: string }> {
    const event = await this.eventRepo.findOne({
      where: { guid: eventGuid },
      select: { guid: true, mode: true, checkInCode: true }
    });

    if (!event) {
      throw new NotFoundException('Event could not be found');
    }

    if (!checksInByCode(event.mode)) {
      throw new UnprocessableEntityException(null, 'Only hybrid and virtual sessions check in with a QR code.');
    }

    if (event.checkInCode) {
      return { code: event.checkInCode };
    }

    await this.eventRepo.update({ guid: eventGuid, checkInCode: IsNull() }, { checkInCode: newCheckInCode() });

    const saved = await this.eventRepo.findOne({
      where: { guid: eventGuid },
      select: { guid: true, checkInCode: true }
    });

    return { code: saved.checkInCode };
  }

  private async insert(eventGuid: string, accountGuid: string, admit?: (event: Event) => void | Promise<void>) {
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
      relations: { location: true, day: true }
    });

    if (!event) {
      throw new UnprocessableEntityException(null, 'Event could not be found');
    }

    await admit?.(event);

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

/**
 * A new check-in code: 128 random bits, URL-safe, 22 characters. Short enough to keep the QR code
 * easy to scan from the back of a room, and far too many to guess.
 */
function newCheckInCode(): string {
  return randomBytes(16).toString('base64url');
}

/**
 * Whether an attendee's code is the session's, compared in constant time. A session with no code yet
 * matches nothing.
 */
function sameCode(given: unknown, stored: string | undefined | null): boolean {
  if (typeof given !== 'string' || !stored) {
    return false;
  }

  const a = Buffer.from(given);
  const b = Buffer.from(stored);

  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Refuses a check-in outside the session's check-in window (#1795).
 */
function assertCheckInOpen(event: Event, now: Date = new Date()) {
  const window = checkInWindow(event.day?.date, event.startTime, event.endTime);

  if (!window) {
    throw new ForbiddenException('Check-in is not open for this session: its time is not set.');
  }

  if (now < window.opens) {
    throw new ForbiddenException(`Check-in for this session opens when it starts, at ${centralTime(window.opens)}.`);
  }

  if (now > window.closes) {
    throw new ForbiddenException('Check-in for this session has closed.');
  }
}

/**
 * A time of day in Central time, such as `4:00 PM`.
 */
function centralTime(at: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit' }).format(at);
}
