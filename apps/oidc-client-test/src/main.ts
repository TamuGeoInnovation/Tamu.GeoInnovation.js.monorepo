/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/

import { NestFactory } from '@nestjs/core';
import passport from 'passport';
import session from 'express-session';
const SQLiteStore = require('connect-sqlite3')(session);

import { OpenIdClient } from '@tamu-gisc/oidc/client';
import { AppModule } from './app/app.module';
import {
  OIDC_CLIENT_METADATA,
  OIDC_CLIENT_PARAMS,
  OIDC_IDP_ISSUER_URL,
  AZURE_AD_UES,
  OIDC_CLIENT_METADATA_AD,
  OIDC_CLIENT_PARAMS_AD
} from './environments/oidcconfig';
import * as path from 'path';

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
  await app.listen(3001);
}

OpenIdClient.build(OIDC_CLIENT_METADATA, OIDC_CLIENT_PARAMS, OIDC_IDP_ISSUER_URL)
  .then(() => bootstrap())
  .catch((err) => {
    console.warn(err);
  });

// OpenIdClient.build(OIDC_CLIENT_METADATA_AD, OIDC_CLIENT_PARAMS_AD, AZURE_AD_UES)
//   .then(() => bootstrap())
//   .catch((err) => {
//     console.warn(err);
//   });
