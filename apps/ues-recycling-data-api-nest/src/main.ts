import { NestFactory } from '@nestjs/core';

import passport from 'passport';
import session from 'express-session';

import Database from 'better-sqlite3';
import createSqliteStore from 'better-sqlite3-session-store';

import { OpenIdClient } from '@tamu-gisc/oidc/client';

import { AppModule } from './app/app.module';
import * as env from './environments/environment';

const SQLiteStore = createSqliteStore(session);
const db = new Database(env.environment.production === true ? env?.sessionStore?.db : 'sessions.db', {
  verbose: env.environment.production === false ? console.log : undefined
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      credentials: true,
      origin: env.environment.allowedOrigins
    }
  });

  app.use(
    session({
      name: 'ues-recycling',
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

  app.setGlobalPrefix(env.environment.globalPrefix);
  const port = env.environment.port || process.env.port || 3333;

  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/' + env.environment.globalPrefix);
  });
}

OpenIdClient.build(env.idpConfig.metadata, env.idpConfig.parameters, env.idpConfig.issuer_url)
  .then(() => bootstrap())
  .catch((err) => {
    console.warn(err);
  });
