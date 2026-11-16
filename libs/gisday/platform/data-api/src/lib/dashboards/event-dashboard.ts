import { NotFoundException } from '@nestjs/common';

import { FindManyOptions, Repository } from 'typeorm';

import { gisdaySite, sessionTime, siteListsSession } from '@tamu-gisc/gisday/common';

import { Event } from '../entities/all.entity';
import { DashboardProfilesService } from './dashboard-profiles.service';
import {
  emptyCounts,
  personOf,
  personTypeOf,
  RsvpDashboard,
  RsvpDashboardPerson
} from '../user-rsvp/dto/rsvp-dashboard.dto';

/** What a dashboard counts: something an account did at an event, and when. An RSVP and a check-in are both one. */
export interface EventRecord {
  accountGuid: string;
  event: Event;
  created: Date;
}

/**
 * An admin dashboard of a season's events (#2878, #3006): each event's records counted by person type, when they were
 * made, and one event's people. A record keeps only its account id, so the type and the name come from that account's
 * Auth0 profile. The RSVP and check-in dashboards are each one of these, over their own records.
 */
export class EventDashboard<T extends EventRecord> {
  constructor(
    protected readonly recordRepo: Repository<T>,
    protected readonly eventRepo: Repository<Event>,
    protected readonly people: DashboardProfilesService
  ) {}

  /**
   * Every event in the season that the site lists, with its records counted by person type, and when each record was
   * made. `host` is the site the admin is on: gisday.tamu.edu shares txgisday.org's database, and lists only Texas A&M's
   * sessions (#2986), so the events, the chart and the count of accounts that could not be read all cover the same
   * records (#3024).
   */
  public async getSeason(seasonGuid: string, host?: string): Promise<RsvpDashboard> {
    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const events = (
      await this.eventRepo.find({
        where: { season: { guid: seasonGuid } },
        relations: { day: true, location: { place: true } }
      })
    ).filter((e) => siteListsSession(site, e));

    // Generic over the record, so typeorm cannot see that every one has an event: the options are cast. The event is
    // asked for by name: an RSVP loads it eagerly, a check-in does not.
    const byEvent = new Map(events.map((e) => [e.guid, { total: 0, counts: emptyCounts() }]));
    // Only the records of the events listed: another organization's are neither counted nor looked up.
    const records = (
      await this.recordRepo.find({
        where: { event: { season: { guid: seasonGuid } } },
        relations: { event: true },
        order: { created: 'ASC' }
      } as FindManyOptions<T>)
    ).filter((r) => byEvent.has(r.event?.guid));

    const profiles = await this.people.profilesOf(records.map((r) => r.accountGuid));

    for (const record of records) {
      const row = byEvent.get(record.event?.guid);

      if (row) {
        row.total++;
        row.counts[personTypeOf(profiles.get(record.accountGuid))]++;
      }
    }

    return {
      events: events
        .map((e) => ({
          guid: e.guid,
          name: e.name ?? null,
          starts: sessionTime(e.day?.date, e.startTime)?.toISOString() ?? null,
          location: [e.location?.building, e.location?.room].filter(Boolean).join(' ') || null,
          place: e.location?.place ? { guid: e.location.place.guid, name: e.location.place.name } : null,
          ...byEvent.get(e.guid)
        }))
        // In the order they happen; an event with no time last.
        .sort((a, b) => (a.starts ?? '￿').localeCompare(b.starts ?? '￿')),
      made: records.map((r) => ({ event: r.event.guid, created: new Date(r.created).toISOString() })),
      unreadAccounts: [...new Set(records.map((r) => r.accountGuid))].filter((a) => profiles.get(a) === null).length
    };
  }

  /** The people behind one event's records, oldest first, each with when their record was made. */
  public async getEvent(eventGuid: string): Promise<Array<RsvpDashboardPerson>> {
    const event = await this.eventRepo.findOne({ where: { guid: eventGuid } });

    if (!event) {
      throw new NotFoundException('Event could not be found');
    }

    const records = await this.recordRepo.find({
      where: { event: { guid: eventGuid } },
      order: { created: 'ASC' }
    } as FindManyOptions<T>);
    const profiles = await this.people.profilesOf(records.map((r) => r.accountGuid));
    const organizations = await this.people.organizationNames();

    return records.map((r) => personOf(profiles.get(r.accountGuid), r.created, organizations));
  }
}
