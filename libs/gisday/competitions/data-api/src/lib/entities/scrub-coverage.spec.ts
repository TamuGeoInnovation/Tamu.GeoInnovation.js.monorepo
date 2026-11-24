import { readFileSync } from 'fs';
import { resolve } from 'path';

import { queryCheckingDataSource } from '@tamu-gisc/gisday/platform/data-api';

import { GISDAY_COMPETITIONS_ENTITIES } from './all.entities';

/**
 * #3102: the script that makes the anonymised copy of the GIS Day database (`scrub.sql`, #1622) names every column of
 * every table, either kept as it is or replaced, and refuses to run on a database with a column it does not name. That
 * refusal only comes when someone runs it against a database that already has the new column, long after the migration
 * that added it. By 15 November 2026 it had fallen behind by two tables and several columns.
 *
 * This compares the script with the API's own entities, which the migrations are generated from, so a pull request that
 * adds a column fails here until the column is put in one list or the other.
 */
const SCRIPT = resolve(__dirname, '../../../../../../../apps/gisday-nest/src/database/scrub.sql');

/** Kept on every table and not listed, as the script says. */
const ALWAYS_KEPT = ['updated', 'created'];

interface ScriptLists {
  kept: Map<string, Set<string>>;
  scrubbed: Map<string, Set<string>>;
  skipped: Set<string>;
}

function read(): ScriptLists {
  const sql = readFileSync(SCRIPT, 'utf8');
  const kept = new Map<string, Set<string>>();
  const scrubbed = new Map<string, Set<string>>();
  const add = (into: Map<string, Set<string>>, table: string, column: string) =>
    into.set(table, (into.get(table) ?? new Set()).add(column));

  // (N'table', N'col,col,...') in @kept; (N'table', N'col', <rule>) in @scrubbed.
  for (const [, table, columns] of sql.matchAll(/^\s*\(N'(\w+)', N'([\w,]+)'\),?;?\s*$/gm)) {
    columns.split(',').forEach((column) => add(kept, table, column.trim()));
  }

  for (const [, table, column] of sql.matchAll(/^\s*\(N'(\w+)', N'(\w+)', /gm)) {
    add(scrubbed, table, column);
  }

  const skippedLine = /INSERT @skipped VALUES (.+);/.exec(sql)?.[1] ?? '';
  const skipped = new Set([...skippedLine.matchAll(/N'(\w+)'/g)].map(([, table]) => table));

  return { kept, scrubbed, skipped };
}

/** Every table the API maps, and its columns as the database names them, junction tables included. */
async function entityColumns(): Promise<Map<string, Set<string>>> {
  const dataSource = await queryCheckingDataSource(GISDAY_COMPETITIONS_ENTITIES);

  return new Map(
    dataSource.entityMetadatas.map((entity) => [
      entity.tableName,
      new Set(entity.columns.map((column) => column.databaseName).filter((name) => !ALWAYS_KEPT.includes(name)))
    ])
  );
}

describe('scrub.sql, the anonymised copy of the GIS Day database (#3102)', () => {
  it('reads the script and the entities', async () => {
    const { kept, scrubbed, skipped } = read();

    expect(kept.get('speakers')?.has('seasonGuid')).toBe(true);
    expect(scrubbed.get('speakers')?.has('email')).toBe(true);
    expect(skipped.has('typeorm_migrations')).toBe(true);
    expect((await entityColumns()).get('speakers')?.has('email')).toBe(true);
  });

  it('names every column of every table the API maps, as kept or replaced', async () => {
    const { kept, scrubbed, skipped } = read();
    const unnamed = [...(await entityColumns())]
      .filter(([table]) => !skipped.has(table))
      .flatMap(([table, columns]) =>
        [...columns].filter((column) => !kept.get(table)?.has(column) && !scrubbed.get(table)?.has(column)).map((c) => `${table}.${c}`)
      );

    expect(unnamed).toEqual([]);
  });

  it('names no column the API does not map, which the script would refuse to run on', async () => {
    const { kept, scrubbed } = read();
    const columns = await entityColumns();
    const listed = [...kept, ...scrubbed].flatMap(([table, named]) => [...named].map((column) => ({ table, column })));

    expect(listed.filter(({ table, column }) => !columns.get(table)?.has(column)).map(({ table, column }) => `${table}.${column}`)).toEqual([]);
  });

  it('names no column twice', () => {
    const { kept, scrubbed } = read();
    const twice = [...scrubbed].flatMap(([table, named]) => [...named].filter((column) => kept.get(table)?.has(column)).map((c) => `${table}.${c}`));

    expect(twice).toEqual([]);
  });
});
