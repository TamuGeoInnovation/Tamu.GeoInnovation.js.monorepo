import { HttpException, HttpStatus } from '@nestjs/common';
import { getConnection, Connection, FindConditions } from 'typeorm';

import {
  AccessToken,
  AuthorizationCode,
  BackchannelAuthenticationRequest,
  Client,
  ClientCredential,
  DeviceCode,
  Grant,
  IRequiredEntityAttrs,
  InitialAccessToken,
  Interaction,
  KindOfId,
  RefreshToken,
  RegistrationAccessToken,
  Session,
  TypeORMEntities,
  ReplayDetection,
  PushedAuthorizationRequest
} from '@tamu-gisc/oidc/common';

/**
 * Used for storing issued tokens, codes, user sessions, etc
 * https://github.com/panva/node-oidc-provider/tree/master/docs#adapter
 */
export class OidcAdapter implements IOidcAdapter {
  public name: string;
  public connection: Connection;
  public repository: TypeORMEntities;
  public repositories: { [table: string]: TypeORMEntities } = {
    Session,
    AccessToken,
    AuthorizationCode,
    RefreshToken,
    DeviceCode,
    ClientCredential,
    Client,
    InitialAccessToken,
    Interaction,
    RegistrationAccessToken,
    ReplayDetection,
    PushedAuthorizationRequest,
    Grant,
    BackchannelAuthenticationRequest
  };
  public grantable: Set<string> = new Set([
    'AccessToken',
    'AuthorizationCode',
    'RefreshToken',
    'DeviceCode',
    'BackchannelAuthenticationRequest'
  ]);
  /**
   * Creates an instance of OidcAdapter.
   */
  constructor(name: string) {
    this.name = name;
    this.connection = getConnection();
    this.repository = this.repositories[name];
  }

  public async upsert(id: KindOfId, data: OIDCUpsertPayload, expiresIn: number) {
    const repo = this.connection.getRepository(this.repository);

    if (repo) {
      if (this.name === 'Session') {
        console.log('Session', id, data.uid);
        // id = data.uid;
      }
      await repo
        .save({
          id: id,
          data: JSON.stringify(data),
          ...(data.grantId ? { grantId: data.grantId } : undefined),
          ...(data.userCode ? { userCode: data.userCode } : undefined),
          ...(data.uid ? { uid: data.uid } : undefined),
          ...(expiresIn ? { expiresAt: new Date(Date.now() + expiresIn * 1000) } : undefined)
        })
        .catch((typeOrmErr) => {
          throw new HttpException(typeOrmErr, HttpStatus.PARTIAL_CONTENT);
        });
    }
  }

  public async find(id: string) {
    const repo = this.connection.getRepository<IRequiredEntityAttrs>(this.repository);
    const found: IRequiredEntityAttrs = (await repo.findOne(id)) as IRequiredEntityAttrs;

    if (!found) {
      return undefined;
    }

    return {
      ...JSON.parse(found.data),
      ...(found.consumedAt ? { consumed: true } : undefined)
    };
  }

  public async findByUserCode(userCode: KindOfId) {
    const repo = this.connection.getRepository<IRequiredEntityAttrs>(this.repository);
    const found = await repo.findOne({
      where: {
        userCode
      }
    });

    if (!found) {
      return undefined;
    }

    return {
      ...JSON.parse(found.data),
      ...(found.consumedAt ? { consumed: true } : undefined)
    };
  }

  public async findByUid(uid: KindOfId) {
    const repo = this.connection.getRepository<IRequiredEntityAttrs>(this.repository);
    const found: IRequiredEntityAttrs = await repo.findOne({
      where: {
        uid: uid
      }
    });

    if (!found) {
      return undefined;
    }

    return {
      ...JSON.parse(found.data),
      ...(found.consumedAt ? { consumed: true } : undefined)
    }; // is there ever a time in which data is null? If so how do we return?
  }

  public async consume(id: KindOfId) {
    const repo = this.connection.getRepository<IRequiredEntityAttrs>(this.repository);
    const findCond: FindConditions<IRequiredEntityAttrs> = {
      id: `${id}`
    };

    await repo.update(findCond, {
      consumedAt: new Date().toISOString()
    });
  }

  public async destroy(id: KindOfId) {
    const repo = this.connection.getRepository(this.repository);

    await repo
      .delete({
        id: `${id}` // Old v6 Adapter used grantId: `${id}` instead of id
      })
      .catch((typeOrmErr) => {
        throw typeOrmErr;
      });
  }

  public async revokeByGrantId(grantId: KindOfId) {
    const repo = this.connection.getRepository<IRequiredEntityAttrs>(this.repository);

    await repo.delete({
      grantId: `${grantId}`
    });
  }
}

interface IOidcAdapter {
  upsert(id, payload, expiresIn);
  find(id);
  findByUserCode(userCode);
  findByUid(uid);
  destroy(id);
  revokeByGrantId(grantId);
  consume(id);
}

interface OIDCUpsertPayload {
  clientId?: string;
  accountId?: string;
  iat?: number;
  exp?: number;
  uid?: string;
  jti?: string;
  kind?: string;
  returnTo?: string;
  userCode?: string;
  params?: {
    client_id?: string;
    prompt?: string;
    redirect_uri?: string;
    response_type?: string;
    scope?: string;
    state?: string;
  };
  prompt?: {
    details?: {
      id_token_hint?: string;
      login_hint?: string;
      max_age?: number | string;
    };
    name: string;
    reasons?: string[];
  };
  grantId?: string;
}
