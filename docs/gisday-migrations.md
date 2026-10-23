# Changing the GIS Day database

Every change to the GIS Day schema goes through a TypeORM migration: a file in
`apps/gisday-nest/src/database/migrations/` that says how to make the change and how to undo it.
`synchronize` stays off everywhere, and the API never runs migrations when it starts. Part of #1511.

## The commands

Four Nx targets on `gisday-nest` run the TypeORM CLI against
`apps/gisday-nest/src/database/data-source.ts`, which uses the same entities and `TYPEORM_*` variables
as the API:

| Target | What it does |
| --- | --- |
| `gisday-nest:migration-show` | Lists every migration, `[X]` applied or `[ ]` pending |
| `gisday-nest:migration-generate --name=<Name>` | Compares the entities with the database and writes the difference as a new migration. Exits 1 with "No changes in database schema were found" when they agree |
| `gisday-nest:migration-run` | Applies every pending migration, each in a transaction |
| `gisday-nest:migration-revert` | Undoes the most recent applied migration |

Locally, `scripts/gisday-local.sh migrate <show|run|revert|generate <Name>>` runs them against the
`gisday-db` container (see [gisday-local.md](gisday-local.md)). It connects as `sa`, because the
application's login can read and write data but cannot change tables.

## The process for a schema change

1. **Edit the entity** in `libs/gisday/platform/data-api` or `libs/gisday/competitions/data-api`.
2. **Generate the migration**: `scripts/gisday-local.sh migrate generate <Name>`. Then
   `nx format:write`, because the generator's layout is not Prettier's.
3. **Read its SQL.** The generator writes what makes the database match the code, which is not
   always what was meant: renaming a column comes out as a drop and an add, which loses the data.
   Edit the migration by hand when that happens, and check that `down` really undoes `up`.
4. **Run it locally**: `migrate run`, then `migrate show`, then use the site. `migrate revert` and
   run it again to prove `down` works.
5. **Run it on dev**, the same way as production below.
6. **One pull request with the entity and the migration together**, saying what was run and where.
7. **Production**, after the merge: back up the database, run the migration once as its own step,
   then roll out the new image. In that order: the old code keeps working against the new schema
   only if the migration adds things, so a change that removes or renames something is split in two
   releases (add and switch, then remove).

Never set `migrationsRun` so the API migrates at startup. Production runs two copies of the API, and
both would try at once.

A fix to records, not to the schema, takes the same route as a reviewed SQL script.

## Running against dev or production

The targets read the connection from the environment, so the same command serves any database. Put
`TYPEORM_HOST`, `TYPEORM_DATABASE`, `TYPEORM_USERNAME` and `TYPEORM_PASSWORD` in a file outside the
repository, for a login that may change tables, and run from a machine that can reach the server:

```bash
MSYS_NO_PATHCONV=1 docker run --rm -m 4g --env-file <settings file> -e NX_DAEMON=false \
  -v "<checkout>:/w" -v tamu-js-dev-nm:/w/node_modules -w /w node:24.22.1 \
  node node_modules/nx/dist/bin/nx.js run gisday-nest:migration-show
```

Run `migration-show` first and read what it lists as pending before `migration-run`.

**Before a database's first migration**, record `InitialSchema` as applied. It builds all 38 tables
on an empty database; on a database that already has them it would fail. A local copy restored from
the 11 October backup already has the record. Any other existing database needs it once:

```sql
IF OBJECT_ID('typeorm_migrations') IS NULL
  CREATE TABLE typeorm_migrations (id int IDENTITY(1,1) PRIMARY KEY, timestamp bigint NOT NULL, name varchar(255) NOT NULL);
INSERT INTO typeorm_migrations (timestamp, name) VALUES (1791325939619, 'InitialSchema1791325939619');
```

This section has not been used yet: as of 11 October 2026 no migration has been run against the dev
or production database. Doing it once on dev is the last step of #1511.

## What has been proven

On 11 October 2026, against a local copy restored from production:

- `migrate generate` with no entity change found no differences, so the entities and production's
  schema agree.
- With a column added to `Season` as a trial, `generate` wrote an `ALTER TABLE ... ADD`, `run` added
  the column and recorded the migration, `show` listed both as applied, and `revert` dropped the
  column and the record. The trial was then discarded.
