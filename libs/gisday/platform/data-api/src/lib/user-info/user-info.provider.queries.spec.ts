import { DataSource } from 'typeorm';

import { ManagementService } from '@tamu-gisc/common/nest/auth';

import { Organization, University, UserInfo } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository } from '../_base/query-checking-data-source';
import { GisDayAppMetadata, ParticipantType, UserInfoProvider } from './user-info.provider';

// The provider's queries as typeorm builds them, with the real entities (#2363). user-info.provider.spec.ts mocks the
// repositories, so it would pass a query typeorm 1 refuses. The only queries are the lookups of a university or an
// organization a user names as "other"; getUsers and getUserMetadata only call Auth0, and getUser is not implemented.
describe('UserInfoProvider queries, built by typeorm', () => {
  let dataSource: DataSource;
  let provider: UserInfoProvider;

  const ms = {
    assertAvailable: () => undefined,
    updateUserMetadata: async (_: string, info: GisDayAppMetadata) => info
  } as unknown as ManagementService;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  beforeEach(() => {
    provider = new UserInfoProvider(
      queryCheckingRepository(dataSource, UserInfo),
      queryCheckingRepository(dataSource, University),
      queryCheckingRepository(dataSource, Organization),
      ms
    );
  });

  it("saves a student's profile, looking up the other university they name", async () => {
    const profile = {
      app_metadata: { gisday: { attendeeType: ParticipantType.Student, completedProfile: false } },
      user_metadata: {
        education: { id: '123', institution: 'other', otherInstitution: 'A university', fieldOfStudy: 'GIS', classification: 'U1' }
      }
    } as unknown as GisDayAppMetadata;

    const saved = (await provider.updateUserMetadata('auth0|someone', profile)) as unknown as GisDayAppMetadata;

    expect(saved.app_metadata.gisday.completedProfile).toBe(true);
  });

  it("saves an industry profile, looking up the other organization they name", async () => {
    const profile = {
      app_metadata: { gisday: { attendeeType: ParticipantType.Industry, completedProfile: false } },
      user_metadata: {
        occupation: { employer: 'other', otherEmployer: 'A company', department: 'GIS', position: 'Analyst' }
      }
    } as unknown as GisDayAppMetadata;

    const saved = (await provider.updateUserMetadata('auth0|someone', profile)) as unknown as GisDayAppMetadata;

    expect(saved.app_metadata.gisday.completedProfile).toBe(true);
  });
});
