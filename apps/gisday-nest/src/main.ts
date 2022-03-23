import { NestFactory } from '@nestjs/core';

import passport from 'passport';
import session from 'express-session';

// import Database from 'better-sqlite3';
// import createSqliteStore from 'better-sqlite3-session-store';

import { OpenIdClient } from '@tamu-gisc/oidc/client';

import { AppModule } from './app/app.module';
import { environment, origins } from './environments/environment';
import * as env from './environments/environment';

// const SQLiteStore = createSqliteStore(session);
// const db = new Database(env.environment.production === true ? env?.sessionStore?.db : 'sessions.db', {
//   verbose: env.environment.production === false ? console.log : undefined
// });

async function bootstrap() {
  // const sqlStore = new SQLiteStore({
  //   db: 'gisday_nest.db',
  //   concurrentDB: true,
  //   table: 'sessions',
  //   dir: __dirname
  // });
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: origins,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    }
  });
  // app.use(
  //   session({
  //     name: 'geoinnovation',
  //     resave: false,
  //     saveUninitialized: false,
  //     secret: 'GEOINNOVATIONSERVICECENTER',
  //     store: sqlStore,
  //     cookie: {
  //       maxAge: 14 * 24 * 60 * 60 * 1000 // 2 weeks
  //     }
  //   })
  // );
  // app.use(passport.initialize());
  // app.use(passport.session());

  const globalPrefix = environment.globalPrefix;
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.port || environment.port;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

bootstrap();

// OpenIdClient.build(OIDC_CLIENT_METADATA_BASIC, OIDC_CLIENT_PARAMS, OIDC_IDP_ISSUER_URL)
//   .then(() => bootstrap())
//   .catch((err) => {
//     console.warn(err);
//   });
