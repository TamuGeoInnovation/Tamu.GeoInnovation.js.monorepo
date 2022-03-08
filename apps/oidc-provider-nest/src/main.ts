import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { Provider } from 'oidc-provider';
import * as express from 'express';
import * as rateLimit from 'express-rate-limit';
import * as yargs from 'yargs';
import { urlencoded, json } from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'path';

// import { OpenIdProvider } from '@tamu-gisc/oidc/provider-nestjs';
import {
  ClientMetadataModule,
  ClientMetadataService,
  RoleModule,
  RoleService,
  UserModule,
  UserService,
  TwoFactorAuthUtils,
  Mailer
} from '@tamu-gisc/oidc/common';

import { OidcProviderService } from '@tamu-gisc/oidc/provider';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: ['http://localhost:4200', 'http://localhost:4204'],
      credentials: true
    }
  });

  // Sets up various parameters used during deployment
  // When passing in multiple args in the monorepo you need to use this format:
  // --args='-h=6','-w=9','-d=3'
  // const { argv } = yargs(process.argv.slice(2))
  //   .scriptName('oidc-provider-nest')
  //   .option('s', {
  //     alias: 'setup',
  //     description: 'Create default admin user and oidc-angular client metadata',
  //     type: 'boolean',
  //     implies: ['n', 't', 'r', 'b', 'e', 'p']
  //   })
  //   .option('x', {
  //     alias: 'dropSchema',
  //     description: "Sets the TypeORM 'dropSchema' value to true",
  //     type: 'boolean'
  //   })
  //   .option('n', {
  //     alias: 'clientName',
  //     description: 'With -s, determines what to set the default client_name as',
  //     type: 'string',
  //     nargs: 1
  //   })
  //   .option('t', {
  //     alias: 'clientSecret',
  //     description: 'With -s, determines what to set the default client_secret as',
  //     type: 'string',
  //     nargs: 1
  //   })
  //   .option('r', {
  //     alias: 'redirectUri',
  //     description: 'With -s, determines what to set the default client redirect_uri as',
  //     type: 'string',
  //     nargs: 1
  //   })
  //   .option('b', {
  //     alias: 'backchannelLogoutUri',
  //     description: 'With -s, determines what to set the default client post_logout_redirect_uris as',
  //     type: 'string',
  //     nargs: 1
  //   })
  //   .option('e', {
  //     alias: 'admin-email',
  //     description: 'Email used for the admin account',
  //     type: 'string',
  //     nargs: 1
  //   })
  //   .option('p', {
  //     alias: 'admin-password',
  //     description: 'Password used for the admin account',
  //     type: 'string',
  //     nargs: 1
  //   })
  //   .option('m', {
  //     alias: 'email-provider',
  //     description: 'The email provider (ethereal / tamu / gmail)',
  //     type: 'string',
  //     choices: ['ethereal', 'tamu', 'google']
  //   })
  //   .help()
  //   .alias('help', 'h');

  // if (argv.x) {
  //   console.warn('dropSchema set to true! Dropping all data in db');
  // }
  // if (argv.setup) {
  //   console.log('Setup detected; creating defaults...');
  //   OpenIdProvider.build();
  //   console.warn("After setup, you will need to restart without '-s' so the oidc-admin client can be loaded");
  // } else {
  //   console.log('Not creating defaults... Loading clients');
  //   const service = app.select(ClientMetadataModule).get(ClientMetadataService, { strict: true });

  //   const clients = await service.loadClientMetadaForOidcSetup();
  //   console.log('Clients:', clients);
  //   OpenIdProvider.build(clients);
  // }

  // Only needed during development
  // if (!environment.production) {
  //   enableOIDCDebug(OpenIdProvider.provider);
  // }

  // OpenIdProvider.provider.proxy = true;

  const dir = join(__dirname, 'assets/views');

  // This will setup the Mailer (gmail, ethereal, or tamu-relay)
  // if (argv.m) {
  //   switch (argv.m) {
  //     case 'gmail':
  //       Mailer.build('gmail');
  //       break;
  //     case 'ethereal':
  //       Mailer.build('ethereal');
  //       break;
  //     case 'tamu':
  //       Mailer.build('tamu-relay');
  //       break;
  //   }
  // }

  // This will set the default time step for otplib to 5 minutes
  // TwoFactorAuthUtils.build();

  // app.use(helmet());
  app.setViewEngine('ejs');
  app.set('views', dir);
  // app.set('view engine', 'ejs');
  // app.set('views', dir);
  app.set('x-powered-by', false);
  // TODO: Replace these express.static calls with Nest's ServeStaticModule?
  app.use(express.static(join(__dirname, 'assets', 'views')));
  app.use(express.static(join(__dirname, 'assets', 'styles')));
  app.use(express.static(join(__dirname, 'assets', 'scripts')));
  app.use(express.static(join(__dirname, 'assets', 'images')));
  // app.use(json());
  // app.use(
  //   rateLimit({
  //     windowMs: 15 * 60 * 1000, // 15 minutes
  //     max: 100 // limit each ip to 100 requests per windowMs
  //   })
  // );
  // app.use(urlencoded({ extended: true }));
  app.use(cookieParser());

  // const service = app.get(OidcProviderService, { strict: false });
  // const issuer = `http://localhost:${environment.port}`;

  // service.init(issuer);

  // const providerConfig = await service.generateProviderConfiguration();
  // const provider: Provider = new Provider(issuer, providerConfig);

  // enableOIDCDebug(service.provider);

  const providerRoutePrefix = 'oidc';

  // app.use(`/${providerRoutePrefix}`, service.provider.callback());

  await app.listen(environment.port, () => {
    console.log(`Running... http://localhost:${environment.port}/${providerRoutePrefix}/.well-known/openid-configuration`);

    // setTimeout(async () => {
    //   if (argv.setup) {
    //     const clientMetadataService = app.select(ClientMetadataModule).get(ClientMetadataService, { strict: true });
    //     const roleService = app.select(RoleModule).get(RoleService, { strict: true });
    //     const userService = app.select(UserModule).get(UserService, { strict: true });

    //     try {
    //       // Insert default Grant Types
    //       await clientMetadataService.insertDefaultGrantTypes();
    //       // Insert default Responses Types
    //       await clientMetadataService.insertDefaultResponseTypes();
    //       // Insert default Token Auth Methods
    //       await clientMetadataService.insertDefaultTokenEndpointAuthMethods();
    //       // Create ClientMetadata for oidc-idp-admin (angular site)
    //       await clientMetadataService.insertClientMetadataForAdminSite(argv.n, argv.t, argv.r, argv.b);
    //       // Insert default Roles
    //       await roleService.insertDefaultUserRoles();
    //       // Create Admin user with known password
    //       await userService.insertDefaultAdmin(argv.e, argv.p);
    //       // Insert the secret questions for others to register
    //       await userService.insertDefaultSecretQuestions();
    //       // TODO: Add field to User that will prompt a user to change their password on next login

    //       console.log('Defaults setup complete');
    //     } catch (err) {
    //       console.log(err);
    //       throw new Error('Error setting up defaults.');
    //     }
    //   }
    // }, 3000);
  });
}

bootstrap();
