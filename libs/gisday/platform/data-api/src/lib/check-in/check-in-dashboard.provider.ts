import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CheckIn, Event, UserRsvp } from '../entities/all.entity';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import { EventDashboard } from '../dashboards/event-dashboard';
import { CheckInDashboard } from './dto/check-in-dashboard.dto';

/**
 * The admin check-in dashboard (#3006): each event's check-ins counted by person type, with its RSVPs beside them so
 * turnout can be compared, when they were made, and who checked in at an event. The RSVP dashboard over check-ins.
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
    const dashboard = await super.getSeason(seasonGuid, host);
    const rsvps = await this.rsvpRepo.find({
      where: { event: { season: { guid: seasonGuid } } },
      relations: { event: true },
      select: { guid: true, event: { guid: true } },
      loadEagerRelations: false
    });
    const rsvpsOf = (event: string) => rsvps.filter((r) => r.event?.guid === event).length;

    return { ...dashboard, events: dashboard.events.map((e) => ({ ...e, rsvps: rsvpsOf(e.guid) })) };
  }
}
