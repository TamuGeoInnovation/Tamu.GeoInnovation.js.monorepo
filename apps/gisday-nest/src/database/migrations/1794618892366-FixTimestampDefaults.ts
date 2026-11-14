import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Every GIS Day time recorded hours early on production (#2926).
 *
 * Every table's `created` and `updated` are datetimeoffset columns that defaulted to getdate(): the server's local
 * wall-clock time, with no offset, so SQL Server stored it as +00:00. Production's server runs on Central time, so a
 * submission made at 5:00 PM Central was stored as 5:00 PM UTC and shown as 11:00 AM. Updates were stamped the same
 * way, by TypeORM's `updated = CURRENT_TIMESTAMP`.
 *
 * `up`:
 * 1. Every created and updated default that is getdate() becomes SYSDATETIMEOFFSET(), the server's clock with its
 *    offset, under the same constraint name. The entities say the same (TIMESTAMP_COLUMN), and UpdatedTimestampSubscriber
 *    stamps updates with the API's clock.
 * 2. On a server that is not on UTC, every stored time with offset +00:00 is read again as the server's local time
 *    (`AT TIME ZONE`, which applies daylight saving to each row: 6 hours in CST, 5 in CDT). Only Central time is known
 *    here; another zone stops the migration before anything changes. On a UTC server, such as the local Docker one,
 *    getdate() was UTC already, so the times are right and nothing is corrected.
 *
 * The correction must run before the new API writes anything, because the API stores its times as +00:00 too, correctly,
 * and they would be shifted: run this migration, then roll out the API (docs/gisday-migrations.md).
 *
 * `down` puts the getdate() defaults back and stores Central times as their wall-clock time at +00:00 again, as they were.
 * A time the new API wrote (+00:00, correct) stays as it is.
 */
export class FixTimestampDefaults1794618892366 implements MigrationInterface {
  name = 'FixTimestampDefaults1794618892366';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(defaults("'(getdate())'", 'SYSDATETIMEOFFSET()'));
    await queryRunner.query(`
      ${ZONE}
      IF @zone IS NOT NULL
      BEGIN
        ${eachColumn(
          `N'UPDATE ' + @table + N' SET ' + @column + N' = CAST(' + @column + N' AS datetime2) AT TIME ZONE ''' + @zone +
           N''' WHERE DATEPART(TZOFFSET, ' + @column + N') = 0'`
        )}
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ${ZONE}
      IF @zone IS NOT NULL
      BEGIN
        ${eachColumn(
          `N'UPDATE ' + @table + N' SET ' + @column + N' = TODATETIMEOFFSET(CAST(' + @column + N' AS datetime2), 0)' +
           N' WHERE DATEPART(TZOFFSET, ' + @column + N') <> 0'`
        )}
      END
    `);
    await queryRunner.query(defaults("'(sysdatetimeoffset())'", 'getdate()'));
  }
}

/**
 * Sets @zone to the server's time zone for AT TIME ZONE, or NULL on a server on UTC; stops on a zone it does not know.
 * CURRENT_TIMEZONE() needs SQL Server 2019 or later, which production and the local image both are.
 */
const ZONE = `
  DECLARE @zone sysname = NULL;
  IF DATEDIFF(minute, GETUTCDATE(), GETDATE()) <> 0
  BEGIN
    IF CURRENT_TIMEZONE() LIKE N'%Central Time (US & Canada)%' SET @zone = N'Central Standard Time';
    ELSE THROW 50000, 'FixTimestampDefaults knows only Central time; this server is on another zone. Nothing was changed.', 1;
  END
`;

/** Runs `statement`, built from @table and @column (both quoted), for every datetimeoffset created and updated column. */
function eachColumn(statement: string): string {
  return `
    DECLARE @table nvarchar(300), @column nvarchar(300), @sql nvarchar(max);
    DECLARE timestamps CURSOR LOCAL FAST_FORWARD FOR
      SELECT QUOTENAME(s.name) + N'.' + QUOTENAME(t.name), QUOTENAME(c.name)
      FROM sys.columns c
      JOIN sys.tables t ON t.object_id = c.object_id
      JOIN sys.schemas s ON s.schema_id = t.schema_id
      WHERE c.name IN (N'created', N'updated') AND TYPE_NAME(c.user_type_id) = N'datetimeoffset' AND t.is_ms_shipped = 0;
    OPEN timestamps;
    FETCH NEXT FROM timestamps INTO @table, @column;
    WHILE @@FETCH_STATUS = 0
    BEGIN
      SET @sql = ${statement};
      EXEC sp_executesql @sql;
      FETCH NEXT FROM timestamps INTO @table, @column;
    END
    CLOSE timestamps;
    DEALLOCATE timestamps;
  `;
}

/** Replaces each created and updated default whose definition is `from` with `to`, keeping the constraint's name. */
function defaults(from: string, to: string): string {
  return `
    DECLARE @table nvarchar(300), @column nvarchar(300), @name nvarchar(300), @sql nvarchar(max);
    DECLARE timestamp_defaults CURSOR LOCAL FAST_FORWARD FOR
      SELECT QUOTENAME(s.name) + N'.' + QUOTENAME(t.name), QUOTENAME(c.name), QUOTENAME(d.name)
      FROM sys.default_constraints d
      JOIN sys.columns c ON c.object_id = d.parent_object_id AND c.column_id = d.parent_column_id
      JOIN sys.tables t ON t.object_id = d.parent_object_id
      JOIN sys.schemas s ON s.schema_id = t.schema_id
      WHERE c.name IN (N'created', N'updated') AND LOWER(d.definition) = ${from};
    OPEN timestamp_defaults;
    FETCH NEXT FROM timestamp_defaults INTO @table, @column, @name;
    WHILE @@FETCH_STATUS = 0
    BEGIN
      SET @sql = N'ALTER TABLE ' + @table + N' DROP CONSTRAINT ' + @name +
        N'; ALTER TABLE ' + @table + N' ADD CONSTRAINT ' + @name + N' DEFAULT ${to} FOR ' + @column;
      EXEC sp_executesql @sql;
      FETCH NEXT FROM timestamp_defaults INTO @table, @column, @name;
    END
    CLOSE timestamp_defaults;
    DEALLOCATE timestamp_defaults;
  `;
}
