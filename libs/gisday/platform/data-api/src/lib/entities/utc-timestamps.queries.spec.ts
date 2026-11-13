import { DataSource } from 'typeorm';

import { Event, Tag } from './all.entity';
import { queryCheckingDataSource, recordWrites } from '../_base/query-checking-data-source';

// Every `created` and `updated` time GIS Day stored on production was the database server's local time labelled as UTC,
// so it read 5 or 6 hours early, and VGI scoring's window would have opened 6 hours late (#2584). typeorm writes those
// times two ways: an insert leaves them to the column's default, which was getdate(), and an update sets `updated` to
// CURRENT_TIMESTAMP. Both are the server's local time with no offset, and a datetimeoffset column stores that as +00:00.
// Local stacks run in UTC, which is why nothing caught it.
describe('created and updated are the true instant, whatever the database clock (#2584)', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  it('defaults every created and updated column to SYSDATETIMEOFFSET(), which carries the offset', () => {
    const columns = dataSource.entityMetadatas.flatMap((metadata) =>
      [metadata.createDateColumn, metadata.updateDateColumn]
        .filter((column) => column !== undefined)
        .map((column) => ({
          column: `${metadata.tableName}.${column.databaseName}`,
          default: typeof column.default === 'function' ? column.default() : column.default
        }))
    );

    expect(columns.length).toBeGreaterThan(0);
    expect(columns.filter((c) => c.default !== 'SYSDATETIMEOFFSET()')).toEqual([]);
  });

  const updates = (statements: Array<{ sql: string; parameters: Array<unknown> }>) =>
    statements.filter((s) => /^\s*UPDATE/i.test(s.sql));

  it.each([
    ['a tag', Tag, { name: 'Workshop' }],
    // As EventProvider sets several events active at once.
    ['an event', Event, { active: false }]
  ])('sets updated to the moment of an update of %s, not CURRENT_TIMESTAMP', async (_, entity, changes) => {
    const { statements } = recordWrites(dataSource);
    const before = Date.now();

    await dataSource.getRepository(entity as typeof Tag).update({ guid: 'a' }, changes as never);

    const [update] = updates(statements);
    expect(update.sql).not.toMatch(/CURRENT_TIMESTAMP|getdate/i);
    expect(update.sql).toMatch(/"updated" = @\d+/);

    // The SQL Server driver wraps a typed parameter in an object holding its value.
    const parameters = update.parameters.map((p) => (p !== null && typeof p === 'object' && 'value' in p ? p.value : p));
    const stamp = parameters.find((p) => p instanceof Date) as Date;
    expect(stamp.getTime()).toBeGreaterThanOrEqual(before);
    expect(stamp.getTime()).toBeLessThanOrEqual(Date.now());
  });
});
