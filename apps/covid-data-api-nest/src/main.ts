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
import { environment } from './environments/environment';
import { idpConfig } from './environments/environment';

async function bootstrap() {
  const sqlStore = new SQLiteStore({
    db: 'covid_sessions.db',
    concurrentDB: true,
    table: 'sessions',
    dir: __dirname
  });

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin: [
      'http://localhost:4200',
      'https://idp-dev.geoservices.tamu.edu',
      'https://covid-dev.geoservices.tamu.edu',
      'https://covid.geoservices.tamu.edu',
      'https://jorge-sepulveda.github.io'
    ]
  });

  const globalPrefix = environment.globalPrefix;
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.port || environment.port;

  app.use(
    session({
      name: 'geoinnovation',
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

  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

OpenIdClient.build(idpConfig.metadata, idpConfig.parameters, idpConfig.issuer_url)
  .then(() => bootstrap())
  .catch((err) => {
    console.warn(err);
  });
