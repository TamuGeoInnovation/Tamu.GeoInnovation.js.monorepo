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

// Creating the next season (#3302): `clonePreviousSeason` named the previous season in its where value as the whole loaded
// entity. Its deadlines are null until an admin sets them, and typeorm 1 refuses a null inside a where value while it builds
// the query, so the first find (the season's days) threw and the request answered 500. Built here by typeorm itself, with
// no database (#2363).

describe('SeasonService.clonePreviousSeason, built by typeorm (#3302)', () => {
  let dataSource: DataSource;
  let service: SeasonService;
  let seasonRepo: Repository<Season>;

  beforeEach(async () => {
    dataSource = await queryCheckingDataSource();
    recordWrites(dataSource);
    buildingTransactionFinds(dataSource);
    // `Season.incrementYear` and a season's own `save()` reach the data source through the entity class.
    Season.useDataSource(dataSource);

    seasonRepo = queryCheckingRepository(dataSource, Season);
    service = new SeasonService(seasonRepo, queryCheckingRepository(dataSource, SeasonDay));
  });

  it('clones a previous season whose deadlines are still unset into the next year', async () => {
    // Not active, so the clone does not first save it; the season it saves goes through the entity's own repository.
    answering(seasonRepo, 'find', [loadedSeason({ active: false })]);

    await expect(service.clonePreviousSeason()).resolves.toMatchObject({ year: 2027 });
  });
});
