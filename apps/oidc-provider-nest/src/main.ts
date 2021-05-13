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
  UserService
} from '@tamu-gisc/oidc/common';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true
  });

  const { argv } = yargs(process.argv.slice(2))
    .scriptName('oidc-provider-nest')
    .option('s', {
      alias: 'setup',
      description: 'Create default admin user and oidc-angular client metadata',
      type: 'boolean',
      implies: ['n', 't', 'r', 'e', 'p']
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

  enableOIDCDebug(OpenIdProvider.provider);

  OpenIdProvider.provider.proxy = true;

  const dir = join(__dirname, 'assets/views');

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

    setTimeout(() => {
      if (argv.setup) {
        const clientMetadataService = app.select(ClientMetadataModule).get(ClientMetadataService, { strict: true });

        // Insert default Grant Types
        clientMetadataService.insertDefaultGrantTypes();
        // Insert default Responses Types
        clientMetadataService.insertDefaultResponseTypes();
        // Insert default Token Auth Methods
        clientMetadataService.insertDefaultTokenEndpointAuthMethods();
        // Create ClientMetadata for oidc-idp-admin (angular site)
        clientMetadataService.insertClientMetadataForAdminSite(argv.n, argv.t, argv.r);
        // Insert default Roles
        const roleService = app.select(RoleModule).get(RoleService, { strict: true });
        roleService.insertDefaultUserRoles();
        // Create Admin user with known password
        const userService = app.select(UserModule).get(UserService, { strict: true });
        userService.insertDefaultAdmin(argv.e, argv.p);
        // TODO: Add field to User that will prompt a user to change their password on next login
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
