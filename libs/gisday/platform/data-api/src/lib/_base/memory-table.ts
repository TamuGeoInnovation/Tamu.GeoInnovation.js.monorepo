import { FindOperator } from 'typeorm';

/**
 * A table in memory for the API's specs, with the repository calls the routes make, so a spec can go through Nest's real
 * routing, guards and pipes without a database. Moved here from the judging spec (#3183) for the winners' (#3239), and
 * used by the session details email's shared repeat guard (#3098). Not exported from the library: only specs import it.
 */

/**
 * Whether a row matches a typeorm `where`, as far as these routes ask: equality, `In`, `Not(In)`, `MoreThan` and nested
 * relations.
 */
export function matches(row: unknown, where: Record<string, unknown>): boolean {
  return Object.entries(where).every(([key, wanted]) => {
    const value = (row as Record<string, unknown>)?.[key];

    if (wanted instanceof FindOperator) {
      if (wanted.type === 'not') {
        return !matches(row, { [key]: wanted.value });
      }

      if (wanted.type === 'moreThan') {
        return new Date(value as Date).getTime() > new Date(wanted.value as Date).getTime();
      }

      return (wanted.value as Array<unknown>).includes(value);
    }

    if (wanted !== null && typeof wanted === 'object') {
      return Array.isArray(value)
        ? value.some((v) => matches(v, wanted as Record<string, unknown>))
        : matches(value, wanted as Record<string, unknown>);
    }

    return value === wanted;
  });
}

/** A table in memory, with the repository calls these routes make. */
export class Table<T extends { guid?: string }> {
  public rows: Array<T> = [];

  constructor(private readonly join: (row: T, relations?: Record<string, unknown>) => unknown = (row) => row) {}

  public create = (x: Partial<T>) => ({ ...x }) as T;
  public find = async ({
    where,
    relations
  }: { where?: Record<string, unknown>; relations?: Record<string, unknown> } = {}) =>
    this.rows.filter((r) => !where || matches(r, where)).map((r) => structuredClone(this.join(r, relations)) as T);
  public findOne = async (options: { where: Record<string, unknown>; relations?: Record<string, unknown> }) => {
    return (await this.find(options))[0] ?? null;
  };
  public save = async (x: T | Array<T>) => {
    const all = (Array.isArray(x) ? x : [x]).map((one) => {
      // `created` as the database sets it, from `Date.now`, so a spec can move the clock.
      const row = {
        created: new Date(Date.now()),
        ...one,
        guid: one.guid ?? crypto.randomUUID(),
        updated: new Date(Date.now())
      } as T;
      this.rows = [...this.rows.filter((r) => r.guid !== row.guid), row];
      return row;
    });

    return Array.isArray(x) ? all : all[0];
  };
  public update = async (guid: string, fields: Partial<T>) => {
    this.rows = this.rows.map((r) => (r.guid === guid ? { ...r, ...fields } : r));
  };
  /** By id, by ids, or by a `where`. */
  public delete = async (where: string | Array<string> | Record<string, unknown>) => {
    const before = this.rows.length;
    const gone = (r: T) =>
      typeof where === 'string'
        ? r.guid === where
        : Array.isArray(where)
          ? r.guid !== undefined && where.includes(r.guid)
          : matches(r, where);
    this.rows = this.rows.filter((r) => !gone(r));
    return { affected: before - this.rows.length };
  };
}
