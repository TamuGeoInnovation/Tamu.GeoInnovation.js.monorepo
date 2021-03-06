import { NestFactory } from '@nestjs/core';

import passport from 'passport';
import session from 'express-session';
import * as sqliteStore from 'connect-sqlite3';

import { OpenIdClient } from '@tamu-gisc/oidc/client';

import { AppModule } from './app/app.module';
import { OIDC_CLIENT_METADATA, OIDC_CLIENT_PARAMS, OIDC_IDP_ISSUER_URL } from './environments/oidcconfig';
import { environment } from './environments/environment';

const SQLiteStore = sqliteStore(session);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://localhost', 'http://localhost:4200'],
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    }
  });
  const sqlStore = new SQLiteStore({
    db: 'sessions_admin_nest.db',
    concurrentDB: true,
    table: 'sessions',
    dir: __dirname // WIN,
  });

  app.use(
    session({
      name: 'idp',
      resave: false,
      saveUninitialized: false,
      secret: 'GEOINNOVATIONSERVICECENTER',
      store: sqlStore,
      cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000 // 2 weeks
      }
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(environment.port, () => {
    console.log('Listening at http://localhost:' + environment.port + '/' + environment.globalPrefix);
  });
}

OpenIdClient.build(OIDC_CLIENT_METADATA, OIDC_CLIENT_PARAMS, OIDC_IDP_ISSUER_URL)
  .then(() => bootstrap())
  .catch((err) => {
    console.warn(err);
  });
