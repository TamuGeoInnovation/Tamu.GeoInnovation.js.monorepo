import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CheckIn, Event, UserRsvp } from '../entities/all.entity';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import { EventDashboard } from '../dashboards/event-dashboard';
import { RsvpDashboardPerson } from '../user-rsvp/dto/rsvp-dashboard.dto';
import { CheckInDashboard, CheckInDashboardPerson } from './dto/check-in-dashboard.dto';

/**
 * The admin check-in dashboard (#3006): each event's check-ins counted by person type, with its RSVPs beside them so
 * turnout can be compared, when they were made, and who checked in at an event. The RSVP dashboard over check-ins. Each
 * event also counts its walk-ins, and its list marks a check-in made outside the session's time (#2893).
 */
@Injectable()
export class CheckInDashboardProvider extends EventDashboard<CheckIn> {
  constructor(
    @InjectRepository(CheckIn) checkInRepo: Repository<CheckIn>,
    @InjectRepository(UserRsvp) private readonly rsvpRepo: Repository<UserRsvp>,
    @InjectRepository(Event) eventRepo: Repository<Event>,
    people: DashboardProfilesService
  ) {
    super(checkInRepo, eventRepo, people);
  }

  public override async getSeason(seasonGuid: string, host?: string): Promise<CheckInDashboard> {
    const { dashboard, records } = await this.season(seasonGuid, host);
    const rsvps = await this.rsvpRepo.find({
      where: { event: { season: { guid: seasonGuid } } },
      relations: { event: true },
      select: { guid: true, accountGuid: true, event: { guid: true } },
      loadEagerRelations: false
    });
    const rsvpsOf = (event: string) => rsvps.filter((r) => r.event?.guid === event);
    // A walk-in checked in with no RSVP to that event; an RSVP to another event does not count.
    const walkInsOf = (event: string) => {
      const rsvpd = new Set(rsvpsOf(event).map((r) => r.accountGuid));

      return records.filter((c) => c.event?.guid === event && !rsvpd.has(c.accountGuid)).length;
    };

    return {
      ...dashboard,
      events: dashboard.events.map((e) => ({ ...e, rsvps: rsvpsOf(e.guid).length, walkIns: walkInsOf(e.guid) }))
    };
  }

  protected override person(checkIn: CheckIn, person: RsvpDashboardPerson): CheckInDashboardPerson {
    return { ...person, outsideSessionTime: checkIn.outsideSessionTime === true };
  }
}
