import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { Provider } from 'oidc-provider';
import * as express from 'express';
import * as csurf from 'csurf';
import * as rateLimit from 'express-rate-limit';
import { urlencoded, json } from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'path';

import { OpenIdProvider, ClientMetadataModule, ClientMetadataService } from '@tamu-gisc/oidc/provider-nestjs';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true
  });
  const clientsService = app.select(ClientMetadataModule).get(ClientMetadataService, { strict: true });
  const clients = await clientsService.loadClientMetadaForOidcSetup();
  OpenIdProvider.build(clients);
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
  // app.use(
  //   csurf({
  //     cookie: false // false is default
  //   })
  // );

  app.use('/oidc', OpenIdProvider.provider.callback);

  await app.listenAsync(environment.port);
}

bootstrap();

function enableOIDCDebug(idp: Provider): void {
  idp.addListener('server_error', (error: any, ctx: any) => {
    console.error(error.message);
    throw error;
  });
  idp.addListener('authorization.accepted', (ctx: any) => {
    console.log('authorization.accepted');
  });
  idp.addListener('interaction.started', (detail: any, ctx: any) => {
    console.log('interaction.started');
  });
  idp.addListener('interaction.ended', (ctx: any) => {
    console.log('interaction.ended');
  });
  idp.addListener('authorization.success', (ctx: any) => {
    console.log('authorization.success');
  });
  idp.addListener('authorization.error', (error: any, ctx: any) => {
    console.log('authorization.error');
    console.error(error);
  });

  idp.addListener('grant.success', (ctx: any) => {
    console.log('grant.success');
  });

  idp.addListener('grant.error', (error: any, ctx: any) => {
    console.log('grant.error');
    console.error(ctx);
  });

  idp.addListener('certificates.error', (error: any, ctx: any) => {
    console.log('certificates.error');
    console.error(error);
  });

  idp.addListener('discovery.error', (error: any, ctx: any) => {
    console.log('discovery.error');
    console.error(error);
  });

  idp.addListener('introspection.error', (error: any, ctx: any) => {
    console.log('introspection.error');
    console.error(error);
  });

  idp.addListener('revocation.error', (error: any, ctx: any) => {
    console.log('revocation.error');
    console.error(error);
  });

  idp.addListener('registration_create.success', (client: any, ctx: any) => {
    console.log('registration_create.success');
  });

  idp.addListener('registration_create.error', (error: any, ctx: any) => {
    console.log('registration_create.error');
    console.error(error);
  });

  idp.addListener('registration_read.error', (error: any, ctx: any) => {
    console.log('registration_read.error');
    console.error(error);
  });

  idp.addListener('registration_update.success', (client: any, ctx: any) => {
    console.log('registration_update.success');
  });

  idp.addListener('registration_update.error', (error: any, ctx: any) => {
    console.log('registration_update.error');
    console.error(error);
  });

  idp.addListener('registration_delete.success', (client: any, ctx: any) => {
    console.log('registration_delete.success');
  });

  idp.addListener('registration_delete.error', (error: any, ctx: any) => {
    console.log('registration_delete.error');
    console.error(error);
  });

  idp.addListener('userinfo.error', (error: any, ctx: any) => {
    console.log('userinfo.error');
    console.error(error);
  });

  idp.addListener('check_session.error', (error: any, ctx: any) => {
    console.log('check_session.error');
    console.error(error);
  });

  idp.addListener('check_session_origin.error', (error: any, ctx: any) => {
    console.log('check_session_origin.error');
    console.error(error);
  });

  idp.addListener('webfinger.error', (error: any, ctx: any) => {
    console.log('webfinger.error');
    console.error(error);
  });

  idp.addListener('token.issued', (token: any) => {
    console.log('token.issued');
  });

  idp.addListener('token.consumed', (token: any) => {
    console.log('token.consumed');
  });

  idp.addListener('token.revoked', (token: any) => {
    console.log('token.revoked');
  });

  idp.addListener('grant.revoked', (grantId: any) => {
    console.log('grant.revoked');
  });

  idp.addListener('end_session.success', (ctx: any) => {
    console.log('end_session.success');
  });
  idp.addListener('end_session.error', (error: any, ctx: any) => {
    console.log('end_session.error');
    console.error(error);
  });
  idp.addListener('backchannel.success', (client: Provider, accoundId: string, sid: string, ctx: any) => {
    console.log('backchannel.success');
  });
  idp.addListener('backchannel.error', (error: any, client: Provider, accoundId: string, sid: string, ctx: any) => {
    console.log('backchannel.error');
    console.error(error);
  });
}
