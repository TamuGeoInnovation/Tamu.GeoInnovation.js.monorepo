import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { KoaContextWithOIDC, Provider } from 'oidc-provider';
import * as express from 'express';
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
  app.use('/oidc', OpenIdProvider.provider.callback);

  await app.listenAsync(environment.port);
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
