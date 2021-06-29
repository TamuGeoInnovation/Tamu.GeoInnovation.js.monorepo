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

import { OpenIdProvider } from '@tamu-gisc/oidc/provider-nestjs';
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

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { mailerConfig } from './environments/mailerconfig';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true
  });

  // Sets up various parameters used during deployment
  // When passing in multiple args in the monorepo you need to use this format:
  // --args='-h=6','-w=9','-d=3'
  const { argv } = yargs(process.argv.slice(2))
    .scriptName('oidc-provider-nest')
    .option('s', {
      alias: 'setup',
      description: 'Create default admin user and oidc-angular client metadata',
      type: 'boolean',
      implies: ['n', 't', 'r', 'b', 'e', 'p']
    })
    .option('x', {
      alias: 'dropSchema',
      description: "Sets the TypeORM 'dropSchema' value to true",
      type: 'boolean'
    })
    .option('n', {
      alias: 'clientName',
      description: 'With -s, determines what to set the default client_name as',
      type: 'string',
      nargs: 1
    })
    .option('t', {
      alias: 'clientSecret',
      description: 'With -s, determines what to set the default client_secret as',
      type: 'string',
      nargs: 1
    })
    .option('r', {
      alias: 'redirectUri',
      description: 'With -s, determines what to set the default client redirect_uri as',
      type: 'string',
      nargs: 1
    })
    .option('b', {
      alias: 'backchannelLogoutUri',
      description: 'With -s, determines what to set the default client post_logout_redirect_uris as',
      type: 'string',
      nargs: 1
    })
    .option('e', {
      alias: 'admin-email',
      description: 'Email used for the admin account',
      type: 'string',
      nargs: 1
    })
    .option('p', {
      alias: 'admin-password',
      description: 'Password used for the admin account',
      type: 'string',
      nargs: 1
    })
    .option('m', {
      alias: 'email-provider',
      description: 'The email provider (ethereal / tamu / gmail)',
      type: 'string',
      demandOption: true,
      choices: ['ethereal', 'tamu', 'google']
    })
    .help()
    .alias('help', 'h');

  if (argv.x) {
    console.warn('dropSchema set to true! Dropping all data in db');
  }
  if (argv.setup) {
    console.log('Setup detected; creating defaults...');
    OpenIdProvider.build();
    console.warn("After setup, you will need to restart without '-s' so the oidc-admin client can be loaded");
  } else {
    console.log('Not creating defaults... Loading clients');
    const service = app.select(ClientMetadataModule).get(ClientMetadataService, { strict: true });

    const clients = await service.loadClientMetadaForOidcSetup();
    console.log('Clients:', clients);
    OpenIdProvider.build(clients);
  }

  // Only needed during development
  if (!environment.production) {
    enableOIDCDebug(OpenIdProvider.provider);
  }

  OpenIdProvider.provider.proxy = true;

  const dir = join(__dirname, 'assets/views');

  // This will setup the Mailer (gmail or ethereal)
  // Mailer.build('gmail', mailerConfig);
  Mailer.build('ethereal');

  // This will set the default time step for otplib to 5 minutes
  TwoFactorAuthUtils.build();

  app.use(helmet());
  app.setViewEngine('ejs');
  app.set('views', dir);
  app.set('x-powered-by', false);
  app.use(express.static(join(__dirname, 'assets', 'styles')));
  app.use(express.static(join(__dirname, 'assets', 'scripts')));
  app.use(express.static(join(__dirname, 'assets', 'images')));
  app.use(json());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each ip to 100 requests per windowMs
    })
  );
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use('/oidc', OpenIdProvider.provider.callback);

  await app.listen(environment.port, () => {
    console.log('Listening at http://localhost:' + environment.port + '/' + environment.globalPrefix);

    setTimeout(async () => {
      if (argv.setup) {
        const clientMetadataService = app.select(ClientMetadataModule).get(ClientMetadataService, { strict: true });
        const roleService = app.select(RoleModule).get(RoleService, { strict: true });
        const userService = app.select(UserModule).get(UserService, { strict: true });

        try {
          // Insert default Grant Types
          await clientMetadataService.insertDefaultGrantTypes();
          // Insert default Responses Types
          await clientMetadataService.insertDefaultResponseTypes();
          // Insert default Token Auth Methods
          await clientMetadataService.insertDefaultTokenEndpointAuthMethods();
          // Create ClientMetadata for oidc-idp-admin (angular site)
          await clientMetadataService.insertClientMetadataForAdminSite(argv.n, argv.t, argv.r, argv.b);
          // Insert default Roles
          await roleService.insertDefaultUserRoles();
          // Create Admin user with known password
          await userService.insertDefaultAdmin(argv.e, argv.p);
          // Insert the secret questions for others to register
          await userService.insertDefaultSecretQuestions();
          // TODO: Add field to User that will prompt a user to change their password on next login

          console.log('Defaults setup complete');
        } catch (err) {
          console.log(err);
          throw new Error('Error setting up defaults.');
        }
      }
    }, 3000);
  });
}

bootstrap();

function enableOIDCDebug(idp: Provider): void {
  idp.addListener('server_error', (ctx, error) => {
    console.error(error.message);
    throw error;
  });
  idp.addListener('authorization.accepted', (ctx) => {
    console.log('authorization.accepted');
  });
  idp.addListener('interaction.started', (detail, ctx) => {
    console.log('interaction.started');
  });
  idp.addListener('interaction.ended', (ctx) => {
    console.log('interaction.ended');
  });
  idp.addListener('authorization.success', (ctx) => {
    console.log('authorization.success');
  });
  idp.addListener('authorization.error', (error, ctx) => {
    console.log('authorization.error');
    console.error(error);
  });

  idp.addListener('grant.success', (ctx) => {
    console.log('grant.success');
  });

  idp.addListener('grant.error', (error, ctx) => {
    console.log('grant.error');
    console.error(ctx);
  });

  idp.addListener('certificates.error', (error, ctx) => {
    console.log('certificates.error');
    console.error(error);
  });

  idp.addListener('discovery.error', (error, ctx) => {
    console.log('discovery.error');
    console.error(error);
  });

  idp.addListener('introspection.error', (error, ctx) => {
    console.log('introspection.error');
    console.error(error);
  });

  idp.addListener('revocation.error', (error, ctx) => {
    console.log('revocation.error');
    console.error(error);
  });

  idp.addListener('registration_create.success', (client, ctx) => {
    console.log('registration_create.success');
  });

  idp.addListener('registration_create.error', (error, ctx) => {
    console.log('registration_create.error');
    console.error(error);
  });

  idp.addListener('registration_read.error', (error, ctx) => {
    console.log('registration_read.error');
    console.error(error);
  });

  idp.addListener('registration_update.success', (client, ctx) => {
    console.log('registration_update.success');
  });

  idp.addListener('registration_update.error', (error, ctx) => {
    console.log('registration_update.error');
    console.error(error);
  });

  idp.addListener('registration_delete.success', (client, ctx) => {
    console.log('registration_delete.success');
  });

  idp.addListener('registration_delete.error', (error, ctx) => {
    console.log('registration_delete.error');
    console.error(error);
  });

  idp.addListener('userinfo.error', (error, ctx) => {
    console.log('userinfo.error');
    console.error(error);
  });

  idp.addListener('check_session.error', (error, ctx) => {
    console.log('check_session.error');
    console.error(error);
  });

  idp.addListener('check_session_origin.error', (error, ctx) => {
    console.log('check_session_origin.error');
    console.error(error);
  });

  idp.addListener('webfinger.error', (error, ctx) => {
    console.log('webfinger.error');
    console.error(error);
  });

  idp.addListener('token.issued', (token) => {
    console.log('token.issued');
  });

  idp.addListener('token.consumed', (token) => {
    console.log('token.consumed');
  });

  idp.addListener('token.revoked', (token) => {
    console.log('token.revoked');
  });

  idp.addListener('grant.revoked', (grantId) => {
    console.log('grant.revoked');
  });

  idp.addListener('end_session.success', (ctx) => {
    console.log('end_session.success');
  });
  idp.addListener('end_session.error', (error, ctx) => {
    console.log('end_session.error');
    console.error(error);
  });
  idp.addListener('backchannel.success', (client: Provider, accoundId: string, sid: string, ctx) => {
    console.log('backchannel.success');
  });
  idp.addListener('backchannel.error', (error, client: Provider, accoundId: string, sid: string, ctx) => {
    console.log('backchannel.error');
    console.error(error);
  });
}
