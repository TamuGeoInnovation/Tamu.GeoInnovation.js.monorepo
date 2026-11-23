import { DataSource } from 'typeorm';

import { queryCheckingDataSource } from '@tamu-gisc/gisday/platform/data-api';

import { GISDAY_COMPETITIONS_ENTITIES } from './all.entities';

/**
 * #2926, for the competitions' tables: their created and updated default to the server's clock with its offset, as
 * the platform's do (timestamps.queries.spec.ts there), never getdate(), which stored Central time as UTC.
 */
describe("the competitions' created and updated (#2926)", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource(GISDAY_COMPETITIONS_ENTITIES);
  });

  it("defaults every competition table's created and updated to SYSDATETIMEOFFSET()", () => {
    const competitionTables = new Set(GISDAY_COMPETITIONS_ENTITIES.map((e) => dataSource.getMetadata(e).tableName));
    const columns = dataSource.entityMetadatas
      .filter((m) => competitionTables.has(m.tableName))
      .flatMap((m) =>
        [m.createDateColumn, m.updateDateColumn].filter(Boolean).map((c) => ({ table: m.tableName, column: c }))
      );

    expect(columns.length).toBeGreaterThan(5);

    const wrong = columns
      .map(({ table, column }) => ({
        name: `${table}.${column.databaseName}`,
        value: dataSource.driver.normalizeDefault(column)
      }))
      .filter((c) => c.value !== 'SYSDATETIMEOFFSET()');

    expect(wrong).toEqual([]);
  });
});
