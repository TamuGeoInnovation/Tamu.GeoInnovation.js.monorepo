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
import { OIDC_CLIENT_METADATA, OIDC_IDP_ISSUER_URL, OIDC_CLIENT_PARAMS } from './environments/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const globalPrefix = 'api';
  // app.setGlobalPrefix(globalPrefix);
  // const port = process.env.port || 3333;
  // await app.listen(port, () => {
  //   console.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  // });
  const sqlStore = new SQLiteStore({
    db: 'sessions.db',
    concurrentDB: true,
    table: 'sessions_nestoidc',
    dir: 'C:\\DevSource\\Tamu\\nestjs-oidc\\db' // WIN
  });

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
  await app.listen(3000);
}

OpenIdClient.build(OIDC_CLIENT_METADATA, OIDC_CLIENT_PARAMS, OIDC_IDP_ISSUER_URL)
  .then(() => bootstrap())
  .catch((err) => {
    console.warn(err);
  });
