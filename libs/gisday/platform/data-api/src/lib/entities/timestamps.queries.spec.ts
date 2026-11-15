import { DataSource } from 'typeorm';

import { Submission } from './all.entity';
import { queryCheckingDataSource, recordWrites } from '../_base/query-checking-data-source';

/**
 * #2926: every recorded time was hours early on production. TypeORM's SQL Server defaults are getdate(), the server's
 * local wall-clock time with no offset, so a datetimeoffset column stored 5:00 PM Central as 5:00 PM UTC. Inserts took
 * the column default; updates wrote `updated = CURRENT_TIMESTAMP`, the same thing again. `save()` updates through the same
 * query builder, after the same event, so `repository.update` stands for both. Both are checked here as
 * typeorm builds them, with every GIS Day entity. The competitions' entities have the same check in their own library.
 */
describe('created and updated, as typeorm writes them (#2926)', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  it("defaults every table's created and updated to the server's clock with its offset, never getdate()", () => {
    const columns = dataSource.entityMetadatas
      .filter((m) => m.tableType === 'regular')
      .flatMap((m) =>
        [m.createDateColumn, m.updateDateColumn].filter(Boolean).map((c) => ({ table: m.tableName, column: c }))
      );

    // Every table has both, as the base entities give them.
    expect(columns.length).toBeGreaterThan(50);

    const wrong = columns
      .map(({ table, column }) => ({
        name: `${table}.${column.databaseName}`,
        value: dataSource.driver.normalizeDefault(column)
      }))
      .filter((c) => c.value !== 'SYSDATETIMEOFFSET()');

    expect(wrong).toEqual([]);
  });

  it('stamps updated from the API clock on repository.update, rather than CURRENT_TIMESTAMP', async () => {
    const { statements } = recordWrites(dataSource);
    const before = Date.now();

    await dataSource.createQueryRunner().manager.update(Submission, { guid: 's-1' }, { reviewed: true });

    const update = statements.find((s) => /^\s*UPDATE/i.test(s.sql));
    expect(update.sql).not.toMatch(/CURRENT_TIMESTAMP/i);
    expect(update.sql).toMatch(/"updated" = @\d+/);

    // The driver wraps each parameter with its column type: `updated` is an instant, sent as a datetimeoffset.
    const stamped = update.parameters.find((p) => (p as { type?: string })?.type === 'datetimeoffset') as { value: Date };
    expect(stamped.value).toBeInstanceOf(Date);
    expect(stamped.value.getTime()).toBeGreaterThanOrEqual(before);
  });
});
