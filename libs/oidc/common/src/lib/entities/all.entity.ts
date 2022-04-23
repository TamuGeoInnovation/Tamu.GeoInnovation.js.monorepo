import { Req } from '@nestjs/common';

import {
  getConnection,
  BeforeUpdate,
  BeforeInsert,
  Entity,
  EntitySchema,
  Column,
  PrimaryColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  JoinTable,
  ManyToMany,
  BaseEntity,
  Repository,
  EntityRepository
} from 'typeorm';
import { Request } from 'express';
import { v4 as guid } from 'uuid';

export type TypeORMEntities = string | (new () => unknown) | EntitySchema<unknown>;
export type KindOfId = number | string;
export type OidcEntity = IRequiredEntityAttrs;

export interface IRequiredEntityAttrs {
  id: string;
  grantId?: string;
  userCode?: string;
  uid?: string;
  data: string;
  expiresAt: Date;
  consumedAt: Date;
}

export interface IClientMetadata {
  client_id: string;
  client_secret: string;
  grant_types: string[];
  redirect_uris: string[];
  response_types: string[];
  token_endpoint_auth_method: string;
  post_logout_redirect_uris: string[];
}

export interface INewRole {
  userGuid: string;
  clientGuid: string;
  roleGuid: string;
}

@Entity()
export class GuidIdentity extends BaseEntity {
  @PrimaryColumn()
  public guid: string;

  @BeforeUpdate()
  @BeforeInsert()
  private generateGuid(): void {
    if (this.guid === undefined) {
      this.guid = guid();
    }
  }
}

@Entity({
  name: 'account'
})
export class Account extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: true
  })
  public name: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public given_name: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public family_name: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public nickname: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public profile: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public picture: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public website: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public gender: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public birthdate: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public zoneinfo: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public locale: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public phone_number: string;

  @Column({
    type: 'bit',
    nullable: true
  })
  public phone_number_verified = false;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public address: string;

  @Column({
    nullable: true
  })
  public updated_at: Date;

  @Column({
    nullable: true
  })
  public added: Date;

  constructor(fullName: string) {
    super();
    if (fullName) {
      this.name = fullName;
      if (fullName.includes(' ')) {
        const names: string[] = fullName.split(' ');
        this.given_name = names[0];
        this.family_name = names[1];
      }
    }
    this.updated_at = new Date();
    this.added = new Date();
  }
}

@Entity({
  name: 'user'
})
export class User extends GuidIdentity {
  @Column()
  public added: Date;

  @OneToOne(() => Account, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  public account: Account;

  // @OneToMany((type) => UserRole, (userRole) => userRole.user, { cascade: true, onDelete: 'CASCADE', eager: true })
  // @JoinColumn()
  // public userRoles: UserRole[];

  @Column({
    type: 'varchar',
    nullable: true
  })
  public email: string;

  @Column({
    type: 'bit',
    nullable: true
  })
  public email_verified = false;

  @Column({
    type: 'varchar',
    nullable: true,
    select: false
  })
  public password: string;

  @Column()
  public updatedAt?: Date;

  @Column({
    type: 'bit',
    nullable: true
  })
  public enabled2fa? = false;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public secret2fa?: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public recovery_email: string;

  @Column({
    type: 'bit',
    nullable: true
  })
  public recovery_email_verified = false;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public signup_ip_address: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public last_used_ip_address: string;

  constructor(@Req() request: Request) {
    super();
    if (request) {
      if (request.body) {
        const body = request.body;
        if (body.email) {
          this.email = body.email;
        }
        if (body.password) {
          this.password = body.password;
        }
        if (body.ip) {
          this.signup_ip_address = body.ip;
          this.last_used_ip_address = body.ip;
        }
        this.updatedAt = new Date();
        this.added = new Date();
      }
    }
  }
}

@Entity({
  name: 'access_tokens'
})
export class AccessToken implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public grantId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: '128'
  })
  public clientId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: '128'
  })
  public accountGuid: string;

  @Column({
    type: 'datetime',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'datetime',
    nullable: true
  })
  public consumedAt: Date;

  @Column({
    type: 'datetime',
    nullable: true
  })
  public added: Date;
}

@Entity({
  name: 'authorization_codes'
})
export class AuthorizationCode implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public grantId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public consumedAt: Date;
}

@Entity({
  name: 'backchannel_authentication_request'
})
export class BackchannelAuthenticationRequest implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public grantId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public consumedAt: Date;
}

@Entity({
  name: 'client_credentials'
})
export class ClientCredential implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public consumedAt: Date;
}

@Entity({
  name: 'clients'
})
export class Client implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public consumedAt: Date;
}

@Entity({
  name: 'device_codes'
})
export class DeviceCode implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public grantId: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public userCode: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public consumedAt: Date;
}

@Entity({
  name: 'grants'
})
export class Grant implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public grantId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public consumedAt: Date;
}

@Entity({
  name: 'initial_access_tokens'
})
export class InitialAccessToken implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public consumedAt: Date;
}

@Entity({
  name: 'interaction'
})
export class Interaction implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public grantId?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public consumedAt: Date;
}

@Entity({
  name: 'refresh_tokens'
})
export class RefreshToken implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public grantId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public consumedAt: Date;
}

@Entity({
  name: 'registration_access_tokens'
})
export class RegistrationAccessToken implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public consumedAt: Date;
}

@Entity({
  name: 'replay_detection'
})
export class ReplayDetection implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public consumedAt: Date;
}

@Entity({
  name: 'pushed_authz_request'
})
export class PushedAuthorizationRequest implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public consumedAt: Date;
}

@Entity({
  name: 'sessions'
})
export class Session implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  public id: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public uid: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public grantId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  public data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public consumedAt: Date;
}

@Entity({
  name: 'token_endpoint_auth_methods'
})
export class TokenEndpointAuthMethod extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: false
  })
  public type: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 1024
  })
  public details: string;

  public clientMetadatas: ClientMetadata;
}

@Entity({
  name: 'client_metadata'
})
export class ClientMetadata extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: false
  })
  public clientName: string;

  @Column({
    type: 'varchar',
    nullable: false
  })
  public clientSecret: string;

  @ManyToMany(() => GrantType, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinTable({
    name: 'client_metadata_grant_types'
  })
  public grantTypes: GrantType[];

  @OneToMany(() => RedirectUri, (redirectUri) => redirectUri.clientMetadata)
  public redirectUris: RedirectUri[];

  @OneToMany(() => BackchannelLogoutUri, (backchannelLogoutUri) => backchannelLogoutUri.clientMetadata)
  public backchannelLogoutUris: BackchannelLogoutUri[];

  @ManyToMany(() => ResponseType, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinTable({
    name: 'client_metadata_response_types'
  })
  public responseTypes: ResponseType[];

  @ManyToOne(() => TokenEndpointAuthMethod, (token) => token.clientMetadatas)
  public tokenEndpointAuthMethod: TokenEndpointAuthMethod;
}

@Entity({
  name: 'grant_types'
})
export class GrantType extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: false
  })
  public name: string;

  @Column({
    type: 'varchar',
    nullable: false
  })
  public type: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 1024
  })
  public details: string;
}

@Entity({
  name: 'redirect_uris'
})
export class RedirectUri extends GuidIdentity {
  @ManyToOne(() => ClientMetadata, (client) => client.redirectUris, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  public clientMetadata: ClientMetadata;

  @Column({
    type: 'varchar',
    nullable: false
  })
  public url: string;
}

@Entity({
  name: 'back_channel_logout_uris'
})
export class BackchannelLogoutUri extends GuidIdentity {
  @ManyToOne(() => ClientMetadata, (client) => client.backchannelLogoutUris, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  public clientMetadata: ClientMetadata;

  @Column({
    type: 'varchar',
    nullable: false
  })
  public url: string;
}

@Entity({
  name: 'response_types'
})
export class ResponseType extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: false
  })
  public type: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 1024
  })
  public details: string;
}

@Entity({
  name: 'roles'
})
export class Role extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: false
  })
  public level: string;

  @Column({
    type: 'varchar',
    nullable: false
  })
  public name: string;
}

@Entity({
  name: 'user_roles'
})
export class UserRole extends GuidIdentity {
  @ManyToOne(() => Role, { eager: true })
  public role: Role;

  @ManyToOne(() => ClientMetadata, { eager: true })
  public client: ClientMetadata;

  @ManyToOne(() => User)
  public user: User;
}

@Entity({
  name: 'user_logins'
})
export class UserLogin extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: true
  })
  public grantId: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public email_used: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public ip_addr: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public occured_at: string;
}

@Entity({
  name: 'secret_questions'
})
export class SecretQuestion extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: false
  })
  public questionText: string;
}

@Entity({
  name: 'secret_answers'
})
export class SecretAnswer extends GuidIdentity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  public user: User;

  @ManyToOne(() => SecretQuestion)
  public secretQuestion: SecretQuestion;

  @Column({
    type: 'varchar',
    nullable: false
  })
  public answer: string;
}

@Entity({
  name: 'user_pw_reset'
})
export class UserPasswordReset extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: true
  })
  public userGuid: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public initializerIp: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public token: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public createdAt: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  public expiresAt: string;

  public setToken() {
    if (this.token === undefined) {
      this.token = guid();
    }
  }

  @BeforeInsert()
  private setupTokenAndExpiration(): void {
    if (this.createdAt === undefined) {
      this.createdAt = new Date().toISOString();
    }
    if (this.expiresAt === undefined) {
      this.expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // Should be a 10 min expiration (Date.now() + 10 * 60 * 1000).toISOString();
    }
  }

  constructor(req?: Request) {
    super();
    if (req) {
      if (req.body.ip) {
        this.initializerIp = req.body.ip;
      }
    }
  }
}

@Entity({
  name: 'password_history'
})
export class UserPasswordHistory extends GuidIdentity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  public user: User;

  @Column({
    type: 'varchar',
    nullable: false
  })
  public usedPassword: string;
}

export class CommonRepo<T> extends Repository<T> {
  public async findByKeyShallow<K extends keyof T>(key: K, value: unknown) {
    const op = {
      [key]: value
    };

    return this.createQueryBuilder('entity').where(`entity.${key} = :${key}`, op).getOne();
  }

  public async findByKeyDeep<K extends keyof T>(key: K, value: unknown, includeExludedProps?: boolean, excludedProp?: K) {
    const op = {
      [key]: value
    };

    const relatedProps = this.getRelatedProps();
    const queryBuilder = this.createQueryBuilder('entity');
    if (relatedProps) {
      relatedProps.map((propName) => {
        queryBuilder.leftJoinAndSelect(`entity.${propName}`, propName);
      });
    }
    if (includeExludedProps === true) {
      queryBuilder.addSelect([`entity.${excludedProp}`]);
    }
    return queryBuilder.where(`entity.${key} = :${key}`, op).getOne();
  }

  public async findAllByKeyShallow<K extends keyof T>(key: K, value: unknown) {
    const op = {
      [key]: value
    };

    return this.createQueryBuilder('entity').where(`entity.${key} = :${key}`, op).getMany();
  }

  public async findAllByKeyDeep<K extends keyof T>(key: K, value: unknown) {
    const op = {
      [key]: value
    };

    const relatedProps = this.getRelatedProps();
    const queryBuilder = this.createQueryBuilder('entity');
    if (relatedProps) {
      relatedProps.map((propName) => {
        queryBuilder.leftJoinAndSelect(`entity.${propName}`, propName);
      });
    }
    const ret = await queryBuilder.where(`entity.${key} = :${key}`, op).getMany();
    return ret;
  }

  public async findAllShallow() {
    return this.createQueryBuilder('entity').getMany();
  }

  public async findAllDeep() {
    const relatedProps = this.getRelatedProps();
    const queryBuilder = this.createQueryBuilder('entity');
    if (relatedProps) {
      relatedProps.map((propName) => {
        queryBuilder.leftJoinAndSelect(`entity.${propName}`, propName);
      });
    }
    return queryBuilder.getMany();
  }

  private getRelatedProps() {
    const relations = this.metadata.ownRelations;
    const propNames: string[] = [];
    relations.map((value) => {
      propNames.push(value.propertyName);
    });
    return propNames;
  }
}

@EntityRepository(ClientMetadata)
export class ClientMetadataRepo extends CommonRepo<ClientMetadata> {
  public getClientMetadata(clientGuid: string) {
    return getConnection()
      .getRepository(ClientMetadata)
      .createQueryBuilder('clientmetadata')
      .leftJoinAndSelect('clientmetadata.grantTypes', 'grantTypes')
      .leftJoinAndSelect('clientmetadata.redirectUris', 'redirectUris')
      .leftJoinAndSelect('clientmetadata.responseTypes', 'responseTypes')
      .leftJoinAndSelect('clientmetadata.tokenEndpointAuthMethod', 'tokenEndpointAuthMethod')
      .where(`clientmetadata.guid = :guid`, {
        guid: clientGuid
      })
      .getOne();
  }
}

@EntityRepository(GrantType)
export class GrantTypeRepo extends CommonRepo<GrantType> {}

@EntityRepository(RedirectUri)
export class RedirectUriRepo extends CommonRepo<RedirectUri> {}

@EntityRepository(BackchannelLogoutUri)
export class BackchannelLogoutUriRepo extends CommonRepo<BackchannelLogoutUri> {}

@EntityRepository(ResponseType)
export class ResponseTypeRepo extends CommonRepo<ResponseType> {}

@EntityRepository(TokenEndpointAuthMethod)
export class TokenEndpointAuthMethodRepo extends CommonRepo<TokenEndpointAuthMethod> {}

@EntityRepository(User)
export class UserRepo extends CommonRepo<User> {
  public getUserWithPassword(email: string) {
    return getConnection()
      .getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.account', 'account')
      .where(`user.email = :email`, {
        email: email
      })
      .getOne();
  }

  public getUserWithRoles(userGuid: string, clientGuid: string) {
    return getConnection()
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.account', 'account')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .leftJoinAndSelect('userRoles.client', 'client')
      .where(`user.guid = :userGuid AND client.guid = :clientGuid`, {
        userGuid: userGuid,
        clientGuid: clientGuid
      })
      .getOne();
  }
}

@EntityRepository(Account)
export class AccountRepo extends CommonRepo<Account> {}

@EntityRepository(Role)
export class RoleRepo extends CommonRepo<Role> {}

@EntityRepository(UserRole)
export class UserRoleRepo extends CommonRepo<UserRole> {}

@EntityRepository(UserLogin)
export class UserLoginRepo extends CommonRepo<UserLogin> {}

@EntityRepository(SecretQuestion)
export class SecretQuestionRepo extends CommonRepo<SecretQuestion> {}

@EntityRepository(SecretAnswer)
export class SecretAnswerRepo extends CommonRepo<SecretAnswer> {}

@EntityRepository(UserPasswordReset)
export class UserPasswordResetRepo extends CommonRepo<UserPasswordReset> {}

@EntityRepository(UserPasswordHistory)
export class UserPasswordHistoryRepo extends CommonRepo<UserPasswordHistory> {}

@EntityRepository(AccessToken)
export class AccessTokenRepo extends CommonRepo<AccessToken> {}
