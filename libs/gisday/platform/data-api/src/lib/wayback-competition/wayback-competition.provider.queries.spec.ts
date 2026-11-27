import { DataSource } from 'typeorm';

import { ManholeSubmission, SidewalkSubmission, SignageSubmission, StormwaterSubmission } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository } from '../_base/query-checking-data-source';
import { WaybackCompetitionProvider } from './wayback-competition.provider';

// The provider's reads as typeorm builds them, with the archived submissions' real entities (#2363). They are not among
// the API's entities, so they are added to the data source here; nothing else checks that their metadata builds.
describe('WaybackCompetitionProvider queries, built by typeorm', () => {
  let dataSource: DataSource;
  let provider: WaybackCompetitionProvider;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource([
      SignageSubmission,
      StormwaterSubmission,
      SidewalkSubmission,
      ManholeSubmission
    ]);
  });

  beforeEach(() => {
    provider = new WaybackCompetitionProvider(
      queryCheckingRepository(dataSource, SignageSubmission),
      queryCheckingRepository(dataSource, StormwaterSubmission),
      queryCheckingRepository(dataSource, SidewalkSubmission),
      queryCheckingRepository(dataSource, ManholeSubmission)
    );
  });

  it('lists the signage submissions', async () => {
    await expect(provider.getSignageSubmissions()).resolves.toEqual([]);
  });

  it('lists the stormwater submissions', async () => {
    await expect(provider.getStormwaterSubmissions()).resolves.toEqual([]);
  });

  it('lists the sidewalk submissions', async () => {
    await expect(provider.getSidewalkSubmissions()).resolves.toEqual([]);
  });

  it('lists the manhole submissions', async () => {
    await expect(provider.getManholeSubmissions()).resolves.toEqual([]);
  });
});
