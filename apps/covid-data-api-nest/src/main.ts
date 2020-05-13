/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/

import { NestFactory } from '@nestjs/core';
import passport from 'passport';
import flash from 'connect-flash';
import session from 'express-session';
const SQLiteStore = require('connect-sqlite3')(session);

import { OpenIdClient } from '@tamu-gisc/oidc';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { OIDC_CLIENT_METADATA, OIDC_CLIENT_PARAMS, OIDC_IDP_ISSUER_URL } from './environments/environment.dev';


async function bootstrap() {
  const sqlStore = new SQLiteStore({
    db: 'covid_sessions.db',
    concurrentDB: true,
    table: 'sessions',
    dir: __dirname,
  });
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: "http://localhost:4200",
  });
  const globalPrefix = environment.globalPrefix;
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.port || environment.port;
  app.use(
    session({
      name: 'GISDay',
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
  app.use(flash());
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

OpenIdClient.build(OIDC_CLIENT_METADATA, OIDC_CLIENT_PARAMS, OIDC_IDP_ISSUER_URL)
  .then(() => bootstrap())
  .catch((err) => {
    console.warn(err);
  });
