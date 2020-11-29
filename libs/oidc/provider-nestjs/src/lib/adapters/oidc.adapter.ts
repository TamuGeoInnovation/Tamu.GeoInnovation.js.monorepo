import { getConnection, Connection, FindConditions } from 'typeorm';

import {
  AccessToken,
  AuthorizationCode,
  Client,
  ClientCredential,
  DeviceCode,
  IRequiredEntityAttrs,
  InitialAccessToken,
  Interaction,
  KindOfId,
  RefreshToken,
  RegistrationAccessToken,
  ReplayDetection,
  Session,
  TypeORMEntities
} from '../entities/all.entity';

/**
 * Used for storing issued tokens, codes, user sessions, etc
 * https://github.com/panva/node-oidc-provider/tree/master/docs#adapter
 */
export class OidcAdapter {
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
    ReplayDetection
  };
  public grantable: Set<string> = new Set(['AccessToken', 'AuthorizationCode', 'RefreshToken', 'DeviceCode']);
  /**
   * Creates an instance of OidcAdapter.
   */
  constructor(name: string) {
    this.name = name;
    this.connection = getConnection();
    this.repository = this.repositories[name];
  }

  public grantKeyFor(id: string) {
    return `grant:${id}`;
  }

  public sessionUidKeyFor(id: string) {
    return `sessionUid:${id}`;
  }

  public key(id: KindOfId) {
    return `${this.name}:${id}`;
  }

  public async upsert(id: KindOfId, payload: OIDCUpsertPayload, expiresIn: number) {
    const repo = this.connection.getRepository(this.repository);

    if (repo) {
      await repo.save({
        id,
        data: JSON.stringify(payload),
        grantId: payload.grantId ? payload.grantId : undefined,
        uid: payload.uid ? payload.uid : undefined,
        userCode: payload.userCode ? payload.userCode : undefined,
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined
      });
    }
  }

  public async find(id: string) {
    const repo = this.connection.getRepository<IRequiredEntityAttrs>(this.repository);
    const found: IRequiredEntityAttrs = await repo.findOne(id);

    if (!found) {
      return undefined;
    }

    const data = JSON.parse(found.data);
    const token = {
      ...data,
      ...(found.consumedAt
        ? {
            consumed: true
          }
        : undefined)
    };

    return token;
  }

  public async findByUserCode(userCode: KindOfId) {
    const repo = this.connection.getRepository<IRequiredEntityAttrs>(this.name);
    const found = await repo.findOne({
      where: {
        userCode
      }
    });

    if (!found) {
      return undefined;
    }

    const data = JSON.parse(found.data);

    return {
      ...data,
      ...(found.consumedAt ? { consumed: true } : undefined)
    };
  }

  public async findByUid(uid: KindOfId) {
    const repo = this.connection.getRepository<IRequiredEntityAttrs>(this.repository);
    const found: IRequiredEntityAttrs = await repo.findOne({
      where: {
        uid
      }
    });

    if (!found) {
      return undefined;
    }

    const data = JSON.parse(found.data);

    return {
      ...data,
      ...(found.consumedAt ? { consumed: true } : undefined)
    };
  }

  public async consume(id: KindOfId) {
    const repo = this.connection.getRepository<IRequiredEntityAttrs>(this.name);
    const findCond: FindConditions<IRequiredEntityAttrs> = {
      id: `${id}`
    };

    await repo.update(findCond, {
      consumedAt: new Date().toISOString()
    });
  }

  public async destroy(id: KindOfId) {
    const repo = this.connection.getRepository<IRequiredEntityAttrs>(this.name);

    await repo
      .delete({
        grantId: `${id}`
      })
      .catch((typeOrmErr) => {
        throw typeOrmErr;
      });
  }

  public async revokeByGrantId(grantId: KindOfId) {
    const repo = this.connection.getRepository<IRequiredEntityAttrs>(this.name);

    await repo.delete({
      grantId: `${grantId}`
    });
  }
}

interface OIDCUpsertPayload {
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
