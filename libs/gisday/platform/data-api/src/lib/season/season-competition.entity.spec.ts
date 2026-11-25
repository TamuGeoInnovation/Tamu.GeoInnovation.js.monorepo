import { DataSource, getMetadataArgsStorage } from 'typeorm';

import { Season, SeasonCompetition, SeasonDay } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository } from '../_base/query-checking-data-source';

/** #2948: the competitions a season runs are rows of their own, so a setting for one season's competition can be added. */
describe('SeasonCompetition', () => {
  it('is a table of season and competition, one row each', () => {
    const storage = getMetadataArgsStorage();

    expect(storage.tables.find((t) => t.target === SeasonCompetition)?.name).toBe('season_competitions');
    expect(storage.columns.filter((c) => c.target === SeasonCompetition).map((c) => c.propertyName)).toContain(
      'competitionType'
    );
    expect(storage.uniques.find((u) => u.target === SeasonCompetition)?.columns).toEqual(['season', 'competitionType']);
    expect(storage.columns.filter((c) => c.target === Season).map((c) => c.propertyName)).not.toContain('competitionTypes');
  });

  it("comes with every season, so the pages and the API read a season's competitions without asking", () => {
    const relation = getMetadataArgsStorage().relations.find(
      (r) => r.target === Season && r.propertyName === 'competitions'
    );

    expect(relation?.options.eager).toBe(true);
  });

  it('leaves a season loaded with its competitions usable as a where value, as the API passes seasons around', async () => {
    const dataSource: DataSource = await queryCheckingDataSource();
    const season = {
      guid: 'season-1',
      year: 2026,
      competitions: [{ guid: 'c-1', competitionType: 'poster' }]
    } as unknown as Season;

    await expect(queryCheckingRepository(dataSource, SeasonDay).find({ where: { season } })).resolves.toEqual([]);
  });
});
