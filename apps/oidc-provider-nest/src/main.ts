import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import { IdpServer } from '@tamu-gisc/oidc/provider';
import { Provider } from 'oidc-provider';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // enableOIDCDebug(OpenIdProvider.provider);
  // console.log("Applying oidc-provider...");
  app.use('/oidc', OpenIdProvider.provider.callback);
  // const adapterHost = app.get(HttpAdapterHost);
  // const httpAdapter = adapterHost.httpAdapter;
  // const instance = httpAdapter.getInstance();
  // instance.use(OpenIdProvider.provider.callback);

  // app.use((err, req, res, next) => {
  //   console.log("MAYBE SOMETHING HERE");
  //   if (err.name === "SessionNotFound") {
  //     // handle interaction expired / session not found error
  //     console.error("SESSION NOT FOUND");
  //   }
  //   next(err);
  // });
  await app.listen(4001);
}

OpenIdProvider.build()
  .then(() => {
    bootstrap();
  })
  .catch((err) => {
    console.error(err);
  });

function enableOIDCDebug(idp: Provider): void {
  idp.addListener('server_error', (error: any, ctx: any) => {
    debugger;
  });
  idp.addListener('authorization.accepted', (ctx: any) => {
    debugger;
  });
  idp.addListener('interaction.started', (detail: any, ctx: any) => {
    console.log(detail, ctx);
    debugger;
  });
  idp.addListener('interaction.ended', (ctx: any) => {
    debugger;
  });
  idp.addListener('authorization.success', (ctx: any) => {
    debugger;
  });
  idp.addListener('authorization.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('grant.success', (ctx: any) => {
    debugger;
  });

  idp.addListener('grant.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('certificates.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('discovery.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('introspection.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('revocation.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('registration_create.success', (client: any, ctx: any) => {
    debugger;
  });

  idp.addListener('registration_create.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('registration_read.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('registration_update.success', (client: any, ctx: any) => {
    debugger;
  });

  idp.addListener('registration_update.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('registration_delete.success', (client: any, ctx: any) => {
    debugger;
  });

  idp.addListener('registration_delete.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('userinfo.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('check_session.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('check_session_origin.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('webfinger.error', (error: any, ctx: any) => {
    debugger;
  });

  idp.addListener('token.issued', (token: any) => {
    debugger;
  });

  idp.addListener('token.consumed', (token: any) => {
    debugger;
  });

  idp.addListener('token.revoked', (token: any) => {
    debugger;
  });

  idp.addListener('grant.revoked', (grantId: any) => {
    debugger;
  });

  idp.addListener('end_session.success', (ctx: any) => {
    debugger;
    console.log('end_session.success');
  });
  idp.addListener('end_session.error', (error: any, ctx: any) => {
    debugger;
    console.log('end_session.error');
  });
  idp.addListener('backchannel.success', (client: Provider, accoundId: string, sid: string, ctx: any) => {
    debugger;
    console.log('backchannel.success');
  });
  idp.addListener('backchannel.error', (error: any, client: Provider, accoundId: string, sid: string, ctx: any) => {
    debugger;
    console.log('backchannel.error');
  });
}
