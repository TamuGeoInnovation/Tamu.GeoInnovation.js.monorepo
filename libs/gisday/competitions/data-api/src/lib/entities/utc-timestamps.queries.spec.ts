import { DataSource } from 'typeorm';

import { queryCheckingDataSource, recordWrites } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionSubmission, GISDAY_COMPETITIONS_ENTITIES } from './all.entities';

// The VGI competition's rows keep their times the same way as the platform's, and scoring reads a submission's `created`
// against the season's window, so a time stored 6 hours early would have left the first 6 hours of the competition unscored
// (#2584). The platform's spec says how typeorm writes these times.
describe('competition rows store the true instant (#2584)', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource(GISDAY_COMPETITIONS_ENTITIES);
  });

  it('defaults every competition created and updated column to SYSDATETIMEOFFSET()', () => {
    const competitionTables = dataSource.entityMetadatas.filter((metadata) =>
      GISDAY_COMPETITIONS_ENTITIES.includes(metadata.target as never)
    );
    const defaults = competitionTables.flatMap((metadata) =>
      [metadata.createDateColumn, metadata.updateDateColumn].map((column) => ({
        column: `${metadata.tableName}.${column?.databaseName}`,
        default: typeof column?.default === 'function' ? column.default() : column?.default
      }))
    );

    expect(competitionTables.length).toBe(GISDAY_COMPETITIONS_ENTITIES.length);
    expect(defaults.filter((d) => d.default !== 'SYSDATETIMEOFFSET()')).toEqual([]);
  });

  it('sets a submission’s updated to the moment of an update, not CURRENT_TIMESTAMP', async () => {
    const { statements } = recordWrites(dataSource);

    await dataSource.getRepository(CompetitionSubmission).update({ guid: 'a' }, { userGuid: 'b' });

    const update = statements.find((s) => /^\s*UPDATE/i.test(s.sql));
    expect(update?.sql).not.toMatch(/CURRENT_TIMESTAMP|getdate/i);
    expect(update?.sql).toMatch(/"updated" = @\d+/);
  });
});
