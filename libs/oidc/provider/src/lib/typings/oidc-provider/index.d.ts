declare module 'oidc-provider' {
  import { Request, Response, Handler } from 'express';
  import express, { Router } from 'express';
  import { IncomingMessage, ServerResponse } from 'http';
  import EventEmitter from 'events';

  interface AuthorizationCodeData {
    accountId: string;
    authTime: number;
    claims: {
      /*
      id_token: {
        email: string | null;
        family_name: { essential: boolean };
        gender: { essential: boolean };
        given_name: { value: string };
        locale: { values: string[] };
        middle_name: {};
      };
    */
    };
    clientId: string;
    grantId: string;
    nonce: string;
    redirectUri: string;
    scope: string;
  }

  interface AccessTokenData {
    accountId: string;
    claims: {
      /* id_token:
      { email: null,
        family_name: [Object],
        gender: [Object],
        given_name: [Object],
        locale: [Object],
      middle_name: {} } */
    };
    clientId: string;
    grantId: string;
    scope: string;
  }

  class AuthorizationCode {
    consumed: Date;

    constructor(data: AuthorizationCodeData);

    consume(): Promise<void>;

    save(): Promise<AuthorizationCode>;

    find(
      search: AuthorizationCode,
      options?: {
        ignoreExpiration?: boolean;
      }
    ): Promise<AuthorizationCode>;

    destroy(): Promise<void>;
  }

  class AccessToken {
    constructor(data: AccessTokenData);

    save(): Promise<AccessToken>;

    find(
      search: AccessToken,
      options?: {
        ignoreExpiration?: boolean;
      }
    ): Promise<AccessToken>;

    destroy(): Promise<void>;
  }

  export interface IClient {
    applicationType: 'web' | 'native';
    grantTypes: string[]; // [ "authorization_code" ]
    idTokenSignedResponseAlg: 'RS256';
    requireAuthTime: false;
    responseTypes: string[]; // [ "code" ]
    subjectType: 'public';
    tokenEndpointAuthMethod: 'none';
    requestUris: string[];
    clientId: string;
    clientSecret: string;
    redirectUris: string[];
    introspectionEndpointAuthMethod: 'none';
    modules: any[]; // My custom property
    signText?: string;
  }

  export interface Session {
    _id: string;
    accountId: string | null;
    expiresAt: Date;
    save(time: number): Promise<void>;
    sidFor(client_id: string): boolean;
    login: {};
    interaction: {
      error?: 'login_required';
      error_description: string;
      reason: 'no_session' | 'consent_prompt' | 'client_not_authorized';
      reason_description: string;
    };
    params: {
      client_id: string;
      redirect_uri: string;
      response_mode: 'query';
      response_type: 'code';
      login_hint?: string;
      scope: 'openid';
      state: string;
    };
    returnTo: string;
    signed: null;
    uuid: string;
    id: string;
  }
  class Provider extends EventEmitter {
    public app: express.Application;

    public uuid: string;

    public domain: {};

    public AuthorizationCode: AuthorizationCode;

    public AccessToken: AccessToken;

    public callback: Handler;

    public Client: {
      find: (id: string) => IClient;
    };

    public client: IClient;

    public issuer: string;

    public session: Session;

    public Session: {
      find: (sessionId: string) => Session;
    };

    public params: {
      response_type: 'none';
    };

    public result: boolean;

    public proxy: boolean;

    constructor(url: string, config?: {});

    public initialize(config: {}): Promise<this>;

    public listen(port: string | number): void;

    public interactionDetails(ctx: IncomingMessage): Promise<Session>;

    public setProviderSession(req: IncomingMessage, res: ServerResponse, {}): Promise<any>;

    public interactionFinished(req: IncomingMessage, res: ServerResponse, {}): Promise<void>;

    public interactionResult(req: IncomingMessage, res: ServerResponse, {}): Promise<any>;

    public use(fn: Function): void;

    public addListener(event: OIDCListenerEvent, callback: Handler);
  }

  export default Provider;
}

type OIDCListenerEvent =
  | 'server_error'
  | 'authorization.accepted'
  | 'interaction.started'
  | 'interaction.ended'
  | 'authorization.success'
  | 'authorization.error'
  | 'grant.success'
  | 'grant.error'
  | 'certificates.error'
  | 'discovery.error'
  | 'introspection.error'
  | 'revocation.error'
  | 'registration_create.success'
  | 'registration_create.error'
  | 'registration_read.error'
  | 'registration_update.success'
  | 'registration_update.error'
  | 'registration_delete.success'
  | 'registration_delete.error'
  | 'userinfo.error'
  | 'check_session.error'
  | 'check_session_origin.error'
  | 'webfinger.error'
  | 'token.issued'
  | 'token.consumed'
  | 'token.revoked'
  | 'grant.revoked'
  | 'end_session.success'
  | 'end_session.error'
  | 'backchannel.success'
  | 'backchannel.error';
