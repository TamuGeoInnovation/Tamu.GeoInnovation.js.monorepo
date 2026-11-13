import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { sessionTime } from '@tamu-gisc/gisday/common';

import { Event, UserRsvp } from '../entities/all.entity';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import {
  emptyCounts,
  personOf,
  personTypeOf,
  RsvpDashboard,
  RsvpDashboardPerson
} from './dto/rsvp-dashboard.dto';

/**
 * The admin RSVP dashboard (#2878): each event's RSVPs counted by person type, when they were made, and an event's
 * people. An RSVP keeps only its account id, so the type and the name come from that account's Auth0 profile.
 */
@Injectable()
export class RsvpDashboardProvider {
  constructor(
    @InjectRepository(UserRsvp) private readonly rsvpRepo: Repository<UserRsvp>,
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    private readonly people: DashboardProfilesService
  ) {}

  /** Every event in the season, with its RSVPs counted by person type, and when each RSVP was made. */
  public async getSeason(seasonGuid: string): Promise<RsvpDashboard> {
    const events = await this.eventRepo.find({
      where: { season: { guid: seasonGuid } },
      relations: { day: true, location: true }
    });

    const rsvps = await this.rsvpRepo.find({
      where: { event: { season: { guid: seasonGuid } } },
      order: { created: 'ASC' }
    });

    const profiles = await this.people.profilesOf(rsvps.map((r) => r.accountGuid));
    const byEvent = new Map(events.map((e) => [e.guid, { total: 0, counts: emptyCounts() }]));

    for (const rsvp of rsvps) {
      const row = byEvent.get(rsvp.event?.guid);

      if (row) {
        row.total++;
        row.counts[personTypeOf(profiles.get(rsvp.accountGuid))]++;
      }
    }

    return {
      events: events
        .map((e) => ({
          guid: e.guid,
          name: e.name ?? null,
          starts: sessionTime(e.day?.date, e.startTime)?.toISOString() ?? null,
          location: [e.location?.building, e.location?.room].filter(Boolean).join(' ') || null,
          ...byEvent.get(e.guid)
        }))
        // In the order they happen; an event with no time last.
        .sort((a, b) => (a.starts ?? '￿').localeCompare(b.starts ?? '￿')),
      made: rsvps
        .filter((r) => byEvent.has(r.event?.guid))
        .map((r) => ({ event: r.event.guid, created: new Date(r.created).toISOString() })),
      unreadAccounts: [...new Set(rsvps.map((r) => r.accountGuid))].filter((a) => profiles.get(a) === null).length
    };
  }

  /** The people who RSVP'd for one event, oldest RSVP first. */
  public async getEvent(eventGuid: string): Promise<Array<RsvpDashboardPerson>> {
    const event = await this.eventRepo.findOne({ where: { guid: eventGuid } });

    if (!event) {
      throw new NotFoundException('Event could not be found');
    }

    const rsvps = await this.rsvpRepo.find({ where: { event: { guid: eventGuid } }, order: { created: 'ASC' } });
    const profiles = await this.people.profilesOf(rsvps.map((r) => r.accountGuid));
    const organizations = await this.people.organizationNames();

    return rsvps.map((r) => personOf(profiles.get(r.accountGuid), r.created, organizations));
  }
}
