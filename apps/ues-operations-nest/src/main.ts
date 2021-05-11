import { Logger } from '@nestjs/common';
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
    db: 'ues_operations.db',
    concurrentDB: true,
    table: 'sessions',
    dir: __dirname
  });

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin: environment.allowedOrigins
  });

  const globalPrefix = environment.globalPrefix;
  app.setGlobalPrefix(globalPrefix);

  const port = environment.port || 3333;

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
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

OpenIdClient.build(idpConfig.metadata, idpConfig.parameters, idpConfig.issuer_url)
  .then(() => bootstrap())
  .catch((err) => {
    console.warn(err);
  });
