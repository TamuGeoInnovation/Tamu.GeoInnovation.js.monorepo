import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Auth0UserProfile, ManagementService } from '@tamu-gisc/common/nest/auth';
import { sessionTime } from '@tamu-gisc/gisday/common';

import { Event, Organization, University, UserRsvp } from '../entities/all.entity';
import {
  emptyCounts,
  personOf,
  personTypeOf,
  RsvpDashboard,
  RsvpDashboardPerson
} from './dto/rsvp-dashboard.dto';

/** How long a profile, once read, is used again rather than read again. */
const PROFILE_KEPT_MS = 5 * 60 * 1000;

/**
 * The admin RSVP dashboard (#2878): each event's RSVPs counted by person type, when they were made, and an event's
 * people. An RSVP keeps only its account id, so the type and the name come from that account's Auth0 profile.
 */
@Injectable()
export class RsvpDashboardProvider {
  /** Profiles read in the last few minutes, so expanding an event after the summary reads nothing again. */
  private readonly profiles = new Map<string, { profile: Auth0UserProfile | null; at: number }>();

  constructor(
    @InjectRepository(UserRsvp) private readonly rsvpRepo: Repository<UserRsvp>,
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(University) private readonly universityRepo: Repository<University>,
    @InjectRepository(Organization) private readonly organizationRepo: Repository<Organization>,
    private readonly ms: ManagementService
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

    const profiles = await this.profilesOf(rsvps.map((r) => r.accountGuid));
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
    const profiles = await this.profilesOf(rsvps.map((r) => r.accountGuid));
    const organizations = await this.organizationNames();

    return rsvps.map((r) => personOf(profiles.get(r.accountGuid), r.created, organizations));
  }

  /**
   * Each account's profile, read by searching for many at once (ManagementService.getUsersByIds). An account with no
   * profile (deleted, or in another tenant, as every account in the local copy is) is null, which counts as Not given.
   * If Auth0 cannot be asked at all (management not configured, as locally without credentials), every account is null
   * and nothing is kept, so the next load asks again.
   */
  private async profilesOf(accountGuids: Array<string>): Promise<Map<string, Auth0UserProfile | null>> {
    const accounts = [...new Set(accountGuids.filter(Boolean))];
    const result = new Map<string, Auth0UserProfile | null>();
    const now = Date.now();

    const toRead = accounts.filter((a) => {
      const kept = this.profiles.get(a);

      if (kept && now - kept.at < PROFILE_KEPT_MS) {
        result.set(a, kept.profile);

        return false;
      }

      return true;
    });

    if (toRead.length === 0) {
      return result;
    }

    let found: Map<string, Auth0UserProfile>;

    try {
      found = await this.ms.getUsersByIds(toRead);
    } catch (err) {
      Logger.warn(`Could not read ${toRead.length} accounts' profiles: ${err?.message}`, 'RsvpDashboardProvider');
      toRead.forEach((a) => result.set(a, null));

      return result;
    }

    for (const account of toRead) {
      const profile = found.get(account) ?? null;

      result.set(account, profile);
      this.profiles.set(account, { profile, at: now });
    }

    return result;
  }

  /** University and organization names by id: a profile stores its institution or employer as one of these. */
  private async organizationNames(): Promise<Map<string, string>> {
    const [universities, organizations] = await Promise.all([this.universityRepo.find(), this.organizationRepo.find()]);

    return new Map([...universities, ...organizations].map((o) => [o.guid, o.name]));
  }
}
