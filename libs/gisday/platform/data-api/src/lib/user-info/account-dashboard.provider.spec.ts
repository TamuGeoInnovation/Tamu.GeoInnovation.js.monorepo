import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import type { Auth0UserCreated, Auth0UserProfile, ManagementService } from '@tamu-gisc/common/nest/auth';

import { Organization, Season, University } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository } from '../_base/query-checking-data-source';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import { AccountDashboardProvider, HAS_GISDAY_PROFILE } from './account-dashboard.provider';

const account = (id: string, created: string, profile: object): Auth0UserCreated => ({
  created,
  profile: { user_info: { id, given_name: id, family_name: 'Test', email: `${id}@example.edu` }, ...profile } as unknown as Auth0UserProfile
});

const accounts = [
  account('ug', '2026-01-10T15:00:00.000Z', {
    app_metadata: { gisday: { attendeeType: 'student' } },
    user_metadata: { education: { classification: 'Junior', institution: 'u-1' } }
  }),
  account('prof', '2026-03-10T15:00:00.000Z', {
    app_metadata: { gisday: { attendeeType: 'academia' } },
    user_metadata: { occupation: { employer: 'u-1', position: 'Professor' } }
  }),
  account('esri', '2026-10-01T15:00:00.000Z', {
    app_metadata: { gisday: { attendeeType: 'industry' } },
    user_metadata: { occupation: { employer: 'other', otherEmployer: 'Esri' } }
  })
];

describe('AccountDashboardProvider (#2892)', () => {
  let dataSource: DataSource;
  let ms: { getUsersCreatedBetween: jest.Mock; countUsersCreatedBetween: jest.Mock };
  let seasonRepo: ReturnType<typeof queryCheckingRepository<Season>>;
  let universityRepo: ReturnType<typeof queryCheckingRepository<University>>;
  let provider: AccountDashboardProvider;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  beforeEach(() => {
    ms = {
      getUsersCreatedBetween: jest.fn(async () => accounts),
      countUsersCreatedBetween: jest.fn(async () => 5)
    };
    seasonRepo = queryCheckingRepository(dataSource, Season);
    universityRepo = queryCheckingRepository(dataSource, University);

    const findOne = seasonRepo.findOne;
    seasonRepo.findOne = async (options) => {
      // The query is still built by typeorm against the real entity, which is what is checked.
      await findOne.call(seasonRepo, options);
      const where = options.where as { guid?: string };

      if (where.guid === 'missing') {
        return null;
      }

      return (
        where.guid
          ? { guid: 's-2026', year: 2026, days: [{ date: new Date('2026-11-16T06:00:00Z') }, { date: new Date('2026-11-20T06:00:00Z') }] }
          : { guid: 's-2025', year: 2025, days: [{ date: new Date('2025-11-21T06:00:00Z') }] }
      ) as Season;
    };

    const find = universityRepo.find;
    universityRepo.find = async (options) => {
      await find.call(universityRepo, options);

      return [{ guid: 'u-1', name: 'Texas A&M University' }] as Array<University>;
    };

    provider = new AccountDashboardProvider(
      seasonRepo,
      new DashboardProfilesService(universityRepo, queryCheckingRepository(dataSource, Organization), {} as ManagementService),
      ms as unknown as ManagementService
    );
  });

  it("reads the accounts with a GIS Day profile made in the season's window, and every account made in it", async () => {
    const dashboard = await provider.getSeason('s-2026');

    expect(dashboard.window).toEqual({ from: '2025-11-22T06:00:00.000Z', to: '2026-11-21T06:00:00.000Z' });
    expect(ms.getUsersCreatedBetween).toHaveBeenCalledWith(
      new Date('2025-11-22T06:00:00.000Z'),
      new Date('2026-11-21T06:00:00.000Z'),
      HAS_GISDAY_PROFILE,
      { app_metadata: 'gisday', user_metadata: ['occupation', 'education'] }
    );
    expect(ms.countUsersCreatedBetween).toHaveBeenCalledWith(new Date('2025-11-22T06:00:00.000Z'), new Date('2026-11-21T06:00:00.000Z'));
    expect(dashboard.accounts).toBe(3);
    expect(dashboard.allAccounts).toBe(5);
  });

  it('counts them by university or employer, by name, and by person type, with when each was made', async () => {
    const dashboard = await provider.getSeason('s-2026');

    expect(dashboard.rows.map((r) => [r.name, r.total, r.counts.undergraduate, r.counts.academia, r.counts.industry])).toEqual([
      ['Texas A&M University', 2, 1, 1, 0],
      ['Esri', 1, 0, 0, 1]
    ]);
    expect(dashboard.made).toEqual(accounts.map((a) => a.created));
    expect(JSON.stringify(dashboard)).not.toContain('@example.edu');
  });

  it("gives one row's people, and reads Auth0 once for the season and its rows", async () => {
    await provider.getSeason('s-2026');
    const people = await provider.getRow('s-2026', 'texas a&m university');

    expect(people.map((p) => [p.firstName, p.type, p.email])).toEqual([
      ['ug', 'undergraduate', 'ug@example.edu'],
      ['prof', 'academia', 'prof@example.edu']
    ]);
    expect(ms.getUsersCreatedBetween).toHaveBeenCalledTimes(1);
  });

  it('answers 404 for a season that does not exist', async () => {
    await expect(provider.getSeason('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
