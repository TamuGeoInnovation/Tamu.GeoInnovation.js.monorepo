import { NestFactory } from '@nestjs/core';

import passport from 'passport';
import session from 'express-session';
import * as sqliteStore from 'connect-sqlite3';

import { OpenIdClient } from '@tamu-gisc/oidc/client';

import { AppModule } from './app/app.module';
import { environment, idpConfig } from './environments/environment';

const SQLiteStore = sqliteStore(session);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      credentials: true,
      origin: environment.allowedOrigins
    }
  });

  const sqlStore = new SQLiteStore({
    db: 'sessions.db',
    concurrentDB: true,
    table: 'sessions',
    dir: __dirname
  });

  app.use(
    session({
      name: 'ues-recycling',
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

  app.setGlobalPrefix(environment.globalPrefix);
  const port = environment.port || process.env.port || 3333;

  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/' + environment.globalPrefix);
  });
}

OpenIdClient.build(idpConfig.metadata, idpConfig.parameters, idpConfig.issuer_url)
  .then(() => bootstrap())
  .catch((err) => {
    console.warn(err);
  });
