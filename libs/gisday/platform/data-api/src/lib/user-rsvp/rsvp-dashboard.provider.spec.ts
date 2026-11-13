import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import type { Auth0UserProfile, ManagementService } from '@tamu-gisc/common/nest/auth';

import { Event, Organization, University, UserRsvp } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository } from '../_base/query-checking-data-source';
import { RsvpDashboardProvider } from './rsvp-dashboard.provider';

const profiles: Record<string, Auth0UserProfile> = {
  'auth0|ug': {
    app_metadata: { gisday: { attendeeType: 'student' } },
    user_metadata: { education: { classification: 'Senior' } }
  } as unknown as Auth0UserProfile,
  'auth0|grad': {
    app_metadata: { gisday: { attendeeType: 'student' } },
    user_metadata: { education: { classification: 'PhD' } }
  } as unknown as Auth0UserProfile,
  'auth0|prof': { app_metadata: { gisday: { attendeeType: 'academia' } } } as unknown as Auth0UserProfile,
  'auth0|esri': {
    user_info: { given_name: 'Sam', family_name: 'Ortiz', email: 'sam@example.com' },
    app_metadata: { gisday: { attendeeType: 'industry' } },
    user_metadata: { occupation: { employer: 'o-1', department: 'Solutions', position: 'Analyst' } }
  } as unknown as Auth0UserProfile
};

function managementWith(): ManagementService & { getUsersByIds: jest.Mock } {
  return {
    // As the search answers: the ids it found, and nothing for the rest.
    getUsersByIds: jest.fn(
      async (accounts: Array<string>) => new Map(accounts.filter((a) => profiles[a]).map((a) => [a, profiles[a]]))
    )
  } as unknown as ManagementService & { getUsersByIds: jest.Mock };
}

const rsvp = (account: string, event: string, created: string) =>
  ({ accountGuid: account, event: { guid: event }, created: new Date(created) }) as UserRsvp;

describe('RsvpDashboardProvider (#2878)', () => {
  let dataSource: DataSource;
  let ms: ReturnType<typeof managementWith>;
  let provider: RsvpDashboardProvider;
  let rsvpRepo: ReturnType<typeof queryCheckingRepository<UserRsvp>>;
  let eventRepo: ReturnType<typeof queryCheckingRepository<Event>>;
  let organizationRepo: ReturnType<typeof queryCheckingRepository<Organization>>;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  beforeEach(() => {
    ms = managementWith();
    rsvpRepo = queryCheckingRepository(dataSource, UserRsvp);
    eventRepo = queryCheckingRepository(dataSource, Event);
    organizationRepo = queryCheckingRepository(dataSource, Organization);
    provider = new RsvpDashboardProvider(
      rsvpRepo,
      eventRepo,
      queryCheckingRepository(dataSource, University),
      organizationRepo,
      ms
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
          { guid: 'e-late', name: 'Keynote', startTime: '15:00:00 GMT-0600 (Central Standard Time)', day: { date: new Date('2026-11-18T06:00:00Z') } },
          { guid: 'e-early', name: 'Workshop', startTime: '09:00:00 GMT-0600 (Central Standard Time)', day: { date: new Date('2026-11-18T06:00:00Z') }, location: { building: 'ILCB', room: '111' } },
          { guid: 'e-none', name: 'Nobody yet', startTime: '09:00:00 GMT-0600 (Central Standard Time)', day: { date: new Date('2026-11-19T06:00:00Z') } }
        ] as Array<Event>;
      };

      const findRsvps = rsvpRepo.find;
      rsvpRepo.find = async (options) => {
        await findRsvps.call(rsvpRepo, options);

        return [
          rsvp('auth0|ug', 'e-early', '2026-11-01T10:00:00Z'),
          rsvp('auth0|grad', 'e-early', '2026-11-02T10:00:00Z'),
          rsvp('auth0|prof', 'e-early', '2026-11-02T11:00:00Z'),
          rsvp('auth0|esri', 'e-late', '2026-11-03T10:00:00Z'),
          rsvp('auth0|ug', 'e-late', '2026-11-04T10:00:00Z'),
          rsvp('auth0|gone', 'e-late', '2026-11-05T10:00:00Z')
        ];
      };
    });

    it('counts each event by person type, in the order the events happen, with an event nobody has RSVPd for', async () => {
      const dashboard = await provider.getSeason('s-1');

      expect(dashboard.events.map((e) => [e.name, e.total])).toEqual([
        ['Workshop', 3],
        ['Keynote', 3],
        ['Nobody yet', 0]
      ]);
      expect(dashboard.events[0].counts).toEqual({
        undergraduate: 1,
        graduate: 1,
        student: 0,
        academia: 1,
        industry: 0,
        'not-given': 0
      });
      expect(dashboard.events[1].counts).toMatchObject({ undergraduate: 1, industry: 1, 'not-given': 1 });
      expect(dashboard.events[0].location).toBe('ILCB 111');
      // The day's date at the stored time, in Central time: 9 AM CST is 3 PM UTC.
      expect(dashboard.events[0].starts).toBe('2026-11-18T15:00:00.000Z');
    });

    it('counts an account whose profile cannot be read as Not given, and says how many there were', async () => {
      const dashboard = await provider.getSeason('s-1');

      expect(dashboard.unreadAccounts).toBe(1);
    });

    it('gives when each RSVP was made, for the chart, and carries no names', async () => {
      const dashboard = await provider.getSeason('s-1');

      expect(dashboard.made).toHaveLength(6);
      expect(dashboard.made[0]).toEqual({ event: 'e-early', created: '2026-11-01T10:00:00.000Z' });
      expect(JSON.stringify(dashboard)).not.toContain('sam@example.com');
    });

    it('asks for every account in one search, each once however many events it RSVPd for, and not again a minute later', async () => {
      await provider.getSeason('s-1');
      await provider.getSeason('s-1');

      expect(ms.getUsersByIds).toHaveBeenCalledTimes(1);
      expect([...ms.getUsersByIds.mock.calls[0][0]].sort()).toEqual(['auth0|esri', 'auth0|gone', 'auth0|grad', 'auth0|prof', 'auth0|ug']);
    });

    it('counts everyone as Not given when Auth0 cannot be asked, and asks again next time', async () => {
      ms.getUsersByIds.mockRejectedValueOnce(new Error('Auth0 management is not configured on this server.'));

      const dashboard = await provider.getSeason('s-1');

      expect(dashboard.events[0].counts['not-given']).toBe(3);
      expect(dashboard.unreadAccounts).toBe(5);

      await provider.getSeason('s-1');
      expect(ms.getUsersByIds).toHaveBeenCalledTimes(2);
    });
  });

  describe('.getEvent()', () => {
    it('answers 404 for an event that does not exist', async () => {
      await expect(provider.getEvent('e-x')).rejects.toThrow(NotFoundException);
    });

    it("lists the event's people, oldest RSVP first, with employers by name", async () => {
      eventRepo.findOne = async () => ({ guid: 'e-late' }) as Event;
      rsvpRepo.find = async () => [rsvp('auth0|esri', 'e-late', '2026-11-03T10:00:00Z'), rsvp('auth0|gone', 'e-late', '2026-11-05T10:00:00Z')];
      organizationRepo.find = async () => [{ guid: 'o-1', name: 'Esri' }] as Array<Organization>;

      const people = await provider.getEvent('e-late');

      expect(people).toEqual([
        expect.objectContaining({ firstName: 'Sam', email: 'sam@example.com', type: 'industry', organization: 'Esri' }),
        expect.objectContaining({ firstName: null, type: 'not-given' })
      ]);
    });
  });
});
