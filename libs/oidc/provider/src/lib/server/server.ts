import express, { Response, Request } from 'express';
import { urlencoded, json } from 'body-parser';
import cookieParser from 'cookie-parser';
import Provider from 'oidc-provider';
import helmet from 'helmet';
import * as path from 'path';

import { interaction_routes } from '../routes/interaction';
import { accounts_routes } from '../routes/accounts';
import { sites_routes } from '../routes/sites';
import { token_routes } from '../routes/tokens';
import { session_routes } from '../routes/sessions';
import { SequelizeAdapter } from '../adapter/sequelize_adapter';
import { DbManager } from '../sequelize/DbManager';
import { setCORs } from '../middleware/setcors';

export class IdpServer {
  private app: express.Application = express();
  private oidc: Provider;

  private issuer: string;

  constructor(config: IOIDCSserverConfiguration) {
    // Set member values and configuration
    if (config) {
      if (config.issuer) {
        this.issuer = config.issuer;
      } else {
        throw new Error('Issuer not configured.');
      }
    }

    // Initialize provider
    this.oidc = new Provider(this.issuer, config.provider);
    this.oidc
      .initialize({
        adapter: SequelizeAdapter,
        clients: config.clients,
        keystore: {
          keys: config.keys
        }
      })
      .then((result) => {
        this.setupMiddleware();

        if (config) {
          if (config.debug) {
            this.enableDebug();
          }
        }
      });
  }

  private enableDebug(): void {
    this.oidc.addListener('server_error', (error, ctx) => {
      console.log('server_error', error);
    });
    this.oidc.addListener('authorization.accepted', (ctx) => {
      console.log('auth.accepted', ctx);
    });
    this.oidc.addListener('interaction.started', (detail, ctx) => {
      console.log('interaction.started', detail, ctx);
    });
    this.oidc.addListener('interaction.ended', (ctx) => {
      console.log('interaction.ended', ctx);
    });
    this.oidc.addListener('authorization.success', (ctx) => {
      console.log('authorization.success', ctx);
    });
    this.oidc.addListener('authorization.error', (error, ctx) => {
      console.log('authorization.error', error);
    });

    this.oidc.addListener('grant.success', (ctx) => {
      console.log('grant.success', ctx);
    });

    this.oidc.addListener('grant.error', (error, ctx) => {
      console.log('grant.error', error, ctx);
    });

    this.oidc.addListener('certificates.error', (error, ctx) => {
      console.log('certificates.error', error, ctx);
    });

    this.oidc.addListener('discovery.error', (error, ctx) => {
      console.log('discovery.error', error, ctx);
    });

    this.oidc.addListener('introspection.error', (error, ctx) => {
      console.log('introspection.error', error, ctx);
    });

    this.oidc.addListener('revocation.error', (error, ctx) => {
      console.log('revocation.error', error, ctx);
    });

    this.oidc.addListener('registration_create.success', (client, ctx) => {
      console.log('registration_create.success', client, ctx);
    });

    this.oidc.addListener('registration_create.error', (error, ctx) => {
      console.log('registration_create.error', error, ctx);
    });

    this.oidc.addListener('registration_read.error', (error, ctx) => {
      console.log('registration_read.error', error, ctx);
    });

    this.oidc.addListener('registration_update.success', (client, ctx) => {
      console.log('registration_update.success', client, ctx);
    });

    this.oidc.addListener('registration_update.error', (error, ctx) => {
      console.log('registration_update.error', error, ctx);
    });

    this.oidc.addListener('registration_delete.success', (client, ctx) => {
      console.log('registration_delete.success', client, ctx);
    });

    this.oidc.addListener('registration_delete.error', (error, ctx) => {
      console.log('registration_delete.error', error, ctx);
    });

    this.oidc.addListener('userinfo.error', (error, ctx) => {
      console.log('userinfo.error', error, ctx);
    });

    this.oidc.addListener('check_session.error', (error, ctx) => {
      console.log('check_session.error', error, ctx);
    });

    this.oidc.addListener('check_session_origin.error', (error, ctx) => {
      console.log('check_session_origin.error', error, ctx);
    });

    this.oidc.addListener('webfinger.error', (error, ctx) => {
      console.log('webfinger.error', error, ctx);
    });

    this.oidc.addListener('token.issued', (token) => {
      console.log('token.issued', token);
    });

    this.oidc.addListener('token.consumed', (token) => {
      console.log('token.consumed', token);
    });

    this.oidc.addListener('token.revoked', (token) => {
      console.log('token.revoked', token);
    });

    this.oidc.addListener('grant.revoked', (grantId) => {
      console.log('grant.revoked', grantId);
    });

    this.oidc.addListener('end_session.success', (ctx) => {
      console.log('end_session.success');
    });
    this.oidc.addListener('end_session.error', (error, ctx) => {
      console.log('end_session.error');
    });
    this.oidc.addListener('backchannel.success', (client: Provider, accoundId: string, sid: string, ctx) => {
      console.log('backchannel.success');
    });
    this.oidc.addListener('backchannel.error', (error, client: Provider, accoundId: string, sid: string, ctx) => {
      console.log('backchannel.error');
    });
  }

  private setupMiddleware(): void {
    const dir = path.join(__dirname, 'assets/views');

    this.oidc.proxy = true;
    this.app.use(helmet());
    this.app.set('views', dir);
    this.app.set('view engine', 'ejs');
    this.app.set('x-powered-by', false);
    this.app.use(express.static(path.join(__dirname, 'assets/styles')));
    this.app.use(express.static(path.join(__dirname, 'assets/scripts')));
    this.app.use(express.static(path.join(__dirname, 'assets/images')));
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(cookieParser());

    this.app.use(setCORs);

    DbManager.setup();

    accounts_routes(this.app, this.oidc);
    interaction_routes(this.app, this.oidc);
    sites_routes(this.app, this.oidc);
    token_routes(this.app, this.oidc);
    session_routes(this.app, this.oidc);

    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).send({ success: true });
    });

    this.app.use(this.oidc.callback);
  }

  public start(port: number = 4001) {
    this.app.listen(port, () => {
      console.log(`Node Express server listening on http://localhost:${port}`);
    });
  }
}

export interface IOIDCSserverConfiguration {
  debug?: boolean;
  issuer: string;
  provider: object;
  clients: Array<IOIDCClient>;
  keys: IOIDCKeys;
}

export interface IOIDCClient {
  client_id: string;
  client_secret: string;
  grant_types: Array<string>;
  redirect_uris: Array<string>;
  token_endpoint_auth_method: string;
  post_logout_redirect_uris: Array<string>;
  backchannel_logout_session_required: boolean;
  backchannel_logout_uri: string;
}

export type IOIDCKeys = Array<
  | {
      d: string;
      dp: string;
      dq: string;
      e: string;
      kty: string;
      n: string;
      p: string;
      q: string;
      qi: string;
      use: string;
    }
  | { crv: string; d: string; kty: string; x: string; y: string }
>;
