/**
 * TypeORM data source for the migration CLI (#1511).
 *
 * The API itself connects through `TypeOrmModule.forRoot()` in `app.module.ts`; this file exists so
 * the `typeorm` CLI can generate and run migrations against the same entities, with the same
 * `TYPEORM_*` environment variables. It never synchronizes: schema changes go through migrations.
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { GISDAY_ENTITIES } from '@tamu-gisc/gisday/platform/data-api';
import { GISDAY_COMPETITIONS_ENTITIES } from '@tamu-gisc/gisday/competitions/data-api';

export default new DataSource({
  type: 'mssql',
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT ? parseInt(process.env.TYPEORM_PORT, 10) : undefined,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  options: { enableArithAbort: true, trustServerCertificate: true },
  entities: [...GISDAY_ENTITIES, ...GISDAY_COMPETITIONS_ENTITIES],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  dropSchema: false
});
