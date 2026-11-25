import { DataSource, Repository } from 'typeorm';

import { Season, SeasonDay } from '../entities/all.entity';
import {
  answering,
  buildingTransactionFinds,
  loadedSeason,
  queryCheckingDataSource,
  queryCheckingRepository,
  recordWrites
} from '../_base/query-checking-data-source';
import { SeasonService } from './season.service';

// Admin > Seasons > "Add season" (#3571): `clonePreviousSeason` deactivated the latest season by year, and only when that one was
// active. With a later season that is not active, the season actually active was left as it was, and the clone made a second
// active season. Built by typeorm itself, with no database (#2363); the statements are what typeorm would send.

describe('SeasonService.clonePreviousSeason, with an active season that is not the latest (#3571)', () => {
  let dataSource: DataSource;
  let service: SeasonService;
  let seasonRepo: Repository<Season>;
  let statements: Array<{ sql: string; parameters: Array<unknown> }>;

  beforeEach(async () => {
    dataSource = await queryCheckingDataSource();
    ({ statements } = recordWrites(dataSource));
    buildingTransactionFinds(dataSource);
    Season.useDataSource(dataSource);

    seasonRepo = queryCheckingRepository(dataSource, Season);
    service = new SeasonService(seasonRepo, queryCheckingRepository(dataSource, SeasonDay));
  });

  it('deactivates every active season before the new one becomes active', async () => {
    // The latest season, 2031, is not the active one; the active season (2026) is never loaded by the clone.
    answering(seasonRepo, 'find', [loadedSeason({ year: 2031, active: false })]);

    await service.clonePreviousSeason();

    // An UPDATE of the seasons table that sets active off wherever it is on, whichever season that is.
    const deactivates = statements.filter(
      ({ sql, parameters }) =>
        /UPDATE \W?seasons\W? SET \W?active\W?/i.test(sql) &&
        /WHERE[\s\S]*\W?active\W? =/i.test(sql) &&
        // SQL Server's driver hands typeorm a bit as `{ value: 0, type: 'bit' }`.
        parameters.some((p) => p === false || p === 0 || (p as { value?: unknown })?.value === 0)
    );

    expect(deactivates.map(({ sql }) => sql)).toHaveLength(1);
  });
});
