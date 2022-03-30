import { NestFactory } from '@nestjs/core';

import passport from 'passport';
import session from 'express-session';

import Database from 'better-sqlite3';
import createSqliteStore from 'better-sqlite3-session-store';

import { OpenIdClient } from '@tamu-gisc/oidc/client';

import { AppModule } from './app/app.module';
import { environment, origins } from './environments/environment';
import * as env from './environments/environment';

const SQLiteStore = createSqliteStore(session);
const db = new Database(env.environment.production === true ? env?.sessionStore?.db : 'sessions.db', {
  verbose: env.environment.production === false ? console.log : undefined
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: origins,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    }
  });
  app.use(
    session({
      name: 'gisday-nest',
      resave: false,
      saveUninitialized: false,
      secret: env.environment.production === true ? env?.sessionStore?.secret : 'localSecret',
      store: new SQLiteStore({
        client: db,
        expired: {
          clear: true,
          intervalMs: 1000 * 60 * 60 * 24 * 5
        }
      })
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  const port = process.env.port || environment.port;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port);
  });
}

OpenIdClient.build(env.OIDC_CLIENT_METADATA_BASIC, env.OIDC_CLIENT_PARAMS, env.OIDC_IDP_ISSUER_URL)
  .then(() => bootstrap())
  .catch((err) => {
    console.warn(err);
  });
