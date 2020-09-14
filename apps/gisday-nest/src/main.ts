import { NestFactory } from '@nestjs/core';
import passport from 'passport';
import session from 'express-session';
const SQLiteStore = require('connect-sqlite3')(session);
import { OpenIdClient } from '@tamu-gisc/oidc/client';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { OIDC_CLIENT_METADATA, OIDC_CLIENT_PARAMS, OIDC_ISSUER } from './environments/environment';

async function bootstrap() {
  const sqlStore = new SQLiteStore({
    db: 'covid_sessions.db',
    concurrentDB: true,
    table: 'sessions',
    dir: __dirname
  });
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://localhost:4200', 'https://idp-dev.geoservices.tamu.edu']
    }
  });
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
  const port = process.env.port || environment.port;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port);
  });
}
bootstrap();
// OpenIdClient.build(OIDC_CLIENT_METADATA, OIDC_CLIENT_PARAMS, OIDC_ISSUER)
//   .then(() => bootstrap())
//   .catch((err) => {
//     console.warn(err);
//   });
