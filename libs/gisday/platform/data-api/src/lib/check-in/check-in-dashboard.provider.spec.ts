import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import type { Auth0UserProfile, ManagementService } from '@tamu-gisc/common/nest/auth';

import { CheckIn, Event, Organization, University, UserRsvp } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository } from '../_base/query-checking-data-source';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import { CheckInDashboardProvider } from './check-in-dashboard.provider';

const profiles: Record<string, Auth0UserProfile> = {
  'auth0|ug': {
    app_metadata: { gisday: { attendeeType: 'student' } },
    user_metadata: { education: { classification: 'Senior' } }
  } as unknown as Auth0UserProfile,
  'auth0|esri': {
    user_info: { given_name: 'Sam', family_name: 'Ortiz', email: 'sam@example.com' },
    app_metadata: { gisday: { attendeeType: 'industry' } },
    user_metadata: { occupation: { employer: 'o-1' } }
  } as unknown as Auth0UserProfile
};

function management(): ManagementService {
  return {
    getUsersByIds: vi.fn(
      async (accounts: Array<string>) => new Map(accounts.filter((a) => profiles[a]).map((a) => [a, profiles[a]]))
    )
  } as unknown as ManagementService;
}

const checkIn = (account: string, event: string, created: string) =>
  ({ accountGuid: account, event: { guid: event }, created: new Date(created) }) as CheckIn;
/** What #2893 adds to an event's row and a person, read without the types that do not have them yet. */
const walkInsOf = (event: object) => (event as { walkIns?: number }).walkIns;
const outsideOf = (person: object) => (person as { outsideSessionTime?: boolean }).outsideSessionTime;
const rsvp = (account: string, event: string) =>
  ({ accountGuid: account, event: { guid: event }, created: new Date() }) as UserRsvp;

describe('CheckInDashboardProvider (#3006)', () => {
  let dataSource: DataSource;
  let provider: CheckInDashboardProvider;
  let checkInRepo: ReturnType<typeof queryCheckingRepository<CheckIn>>;
  let rsvpRepo: ReturnType<typeof queryCheckingRepository<UserRsvp>>;
  let eventRepo: ReturnType<typeof queryCheckingRepository<Event>>;
  let organizationRepo: ReturnType<typeof queryCheckingRepository<Organization>>;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  beforeEach(() => {
    checkInRepo = queryCheckingRepository(dataSource, CheckIn);
    rsvpRepo = queryCheckingRepository(dataSource, UserRsvp);
    eventRepo = queryCheckingRepository(dataSource, Event);
    organizationRepo = queryCheckingRepository(dataSource, Organization);
    provider = new CheckInDashboardProvider(
      checkInRepo,
      rsvpRepo,
      eventRepo,
      new DashboardProfilesService(queryCheckingRepository(dataSource, University), organizationRepo, management())
    );
  });

  it("builds the season's queries as typeorm writes them, and answers an empty season with nothing", async () => {
    await expect(provider.getSeason('s-1')).resolves.toEqual({ events: [], made: [], unreadAccounts: 0 });
  });

  describe('.getSeason()', () => {
    beforeEach(() => {
      const find = eventRepo.find;
      eventRepo.find = async (options) => {
        await find.call(eventRepo, options);

        return [
          {
            guid: 'e-1',
            name: 'Workshop',
            startTime: '09:00:00 GMT-0600 (Central Standard Time)',
            day: { date: new Date('2026-11-18T06:00:00Z') },
            location: { building: 'ILCB', room: '111', place: { guid: 'p-tamu', name: 'Texas A&M University GIS Day(s)' } }
          },
          {
            guid: 'e-2',
            name: 'Nobody came',
            startTime: '15:00:00 GMT-0600 (Central Standard Time)',
            day: { date: new Date('2026-11-18T06:00:00Z') }
          }
        ] as Array<Event>;
      };

      const findCheckIns = checkInRepo.find;
      checkInRepo.find = async (options) => {
        await findCheckIns.call(checkInRepo, options);

        return [checkIn('auth0|ug', 'e-1', '2026-11-18T15:05:00Z'), checkIn('auth0|esri', 'e-1', '2026-11-18T15:20:00Z')];
      };

      const findRsvps = rsvpRepo.find;
      rsvpRepo.find = async (options) => {
        await findRsvps.call(rsvpRepo, options);

        return [rsvp('auth0|ug', 'e-1'), rsvp('auth0|a', 'e-1'), rsvp('auth0|b', 'e-1'), rsvp('auth0|c', 'e-2')];
      };
    });

    it("counts each event's check-ins by person type, with its RSVPs beside them so turnout can be compared", async () => {
      const dashboard = await provider.getSeason('s-1');

      expect(dashboard.events.map((e) => [e.name, e.total, e.rsvps])).toEqual([
        ['Workshop', 2, 3],
        ['Nobody came', 0, 1]
      ]);
      expect(dashboard.events[0].counts).toMatchObject({ undergraduate: 1, industry: 1, 'not-given': 0 });
    });

    it("counts each event's walk-ins: check-ins by someone who had not RSVP'd to it (#2893)", async () => {
      const dashboard = await provider.getSeason('s-1');

      // e-1: the undergraduate RSVP'd and checked in; Sam checked in without one.
      expect(dashboard.events.map((e) => [e.name, walkInsOf(e)])).toEqual([
        ['Workshop', 1],
        ['Nobody came', 0]
      ]);
    });

    it("counts an RSVP to another event as no RSVP to this one, and reads each RSVP's account (#2893)", async () => {
      const asked = vi.spyOn(rsvpRepo, 'find');
      const findRsvps = rsvpRepo.find;
      rsvpRepo.find = async (options) => {
        await findRsvps.call(rsvpRepo, options);

        return [rsvp('auth0|ug', 'e-1'), rsvp('auth0|esri', 'e-2')];
      };

      const dashboard = await provider.getSeason('s-1');

      expect(walkInsOf(dashboard.events[0])).toBe(1);
      expect(asked.mock.calls[0][0]).toMatchObject({ select: { accountGuid: true, event: { guid: true } } });
    });

    it("gives each event's place, so the page can list only the site's own sessions (#2986)", async () => {
      const dashboard = await provider.getSeason('s-1');

      expect(dashboard.events.map((e) => e.place)).toEqual([
        { guid: 'p-tamu', name: 'Texas A&M University GIS Day(s)' },
        null
      ]);
    });

    it("asks for each check-in's event, which a check-in does not load by itself as an RSVP does", async () => {
      const asked = vi.spyOn(checkInRepo, 'find');

      await provider.getSeason('s-1');

      expect(asked.mock.calls[0][0]).toMatchObject({ relations: { event: true } });
    });

    it('gives when each check-in was made, for the chart, and carries no names', async () => {
      const dashboard = await provider.getSeason('s-1');

      expect(dashboard.made).toEqual([
        { event: 'e-1', created: '2026-11-18T15:05:00.000Z' },
        { event: 'e-1', created: '2026-11-18T15:20:00.000Z' }
      ]);
      expect(JSON.stringify(dashboard)).not.toContain('sam@example.com');
    });
  });

  describe('.getEvent()', () => {
    it("marks each check-in made outside its session's time (#2893, #2635)", async () => {
      eventRepo.findOne = async () => ({ guid: 'e-1' }) as Event;
      checkInRepo.find = async () => [
        { ...checkIn('auth0|esri', 'e-1', '2026-11-18T13:00:00Z'), outsideSessionTime: true } as CheckIn,
        { ...checkIn('auth0|ug', 'e-1', '2026-11-18T15:05:00Z'), outsideSessionTime: false } as CheckIn
      ];

      expect((await provider.getEvent('e-1')).map(outsideOf)).toEqual([true, false]);
    });

    it('answers 404 for an event that does not exist', async () => {
      await expect(provider.getEvent('e-x')).rejects.toThrow(NotFoundException);
    });

    it('lists who checked in, first in first, each with the time they checked in', async () => {
      eventRepo.findOne = async () => ({ guid: 'e-1' }) as Event;
      checkInRepo.find = async () => [checkIn('auth0|esri', 'e-1', '2026-11-18T15:20:00Z')];
      organizationRepo.find = async () => [{ guid: 'o-1', name: 'Esri' }] as Array<Organization>;

      await expect(provider.getEvent('e-1')).resolves.toEqual([
        expect.objectContaining({
          firstName: 'Sam',
          type: 'industry',
          organization: 'Esri',
          created: '2026-11-18T15:20:00.000Z'
        })
      ]);
    });
  });
});
