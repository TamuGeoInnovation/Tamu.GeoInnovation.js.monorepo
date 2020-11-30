import { Req } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { Request } from 'express';
import {
  BeforeUpdate,
  BeforeInsert,
  Entity,
  EntitySchema,
  Column,
  PrimaryColumn,
  TableForeignKey,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  JoinTable,
  ManyToMany,
  BaseEntity,
  Repository,
  getConnection,
  ObjectType,
  EntityRepository
} from 'typeorm';

import { v4 as guid } from 'uuid';
import { ClientAuthMethod } from 'oidc-provider';

export type TypeORMEntities = string | Function | (new () => unknown) | EntitySchema<unknown>;
export type KindOfId = number | string;

export interface IRequiredEntityAttrs {
  id: string;
  grantId?: string;
  userCode?: string;
  uid?: string;
  data: any;
  expiresAt: Date;
  consumedAt: Date;
}

export interface IAccount {
  // id: number;
  guid: string;
  name: string;
  given_name: string;
  family_name: string;
  nickname: string;
  profile: string;
  picture: string;
  website: string;
  // email: string;
  gender: string;
  birthdate: string;
  zoneinfo: string;
  locale: string;
  phone_number: string;
  phone_number_verified: boolean;
  address: string; // actually a JSON representation
  updated_at?: string; // tried with a type of number and it causes a dumb "cannot find 'length' of undefined" error
  added?: string;
}

export interface IUser {
  id: number;
  guid: string;
  email: string;
  email_verified: boolean;
  password: string;
  updatedAt?: string;
  added: string;
  enabled2fa?: boolean;
  secret2fa?: string | null;
  recovery_email: string | null;
  recovery_email_verified: boolean;
  signup_ip_address: string | null;
  last_used_ip_address: string | null;
}

export interface IClientMetadata {
  client_id: string;
  client_secret: string;
  grant_types: string[];
  redirect_uris: string[];
  response_types: string[];
  token_endpoint_auth_method: string;
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
export class Account extends GuidIdentity implements IAccount {
  @Column({
    type: 'varchar',
    nullable: true
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  given_name: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  family_name: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  nickname: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  profile: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  picture: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  website: string;

  // @Column({
  //   type: 'varchar',
  //   nullable: true
  // })
  // email: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  gender: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  birthdate: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  zoneinfo: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  locale: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  phone_number: string;

  @Column({
    type: 'bit',
    nullable: true
  })
  phone_number_verified: boolean = false;

  @Column({
    type: 'varchar',
    nullable: true
  })
  address: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  updated_at: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  added: string;

  constructor(fullName: string, email: string) {
    super();
    try {
      // if (user) {
      // if (user.guid) {
      //   this.guid = user.guid;
      // }
      // if (email) {
      //   this.email = email;
      // }
      if (fullName) {
        this.name = fullName;
        if (fullName.includes(' ')) {
          const names: string[] = fullName.split(' ');
          this.given_name = names[0];
          this.family_name = names[1];
        }
      }
      this.updated_at = new Date().toISOString();
      this.added = new Date().toISOString();
      // }
    } catch (error) {
      throw error;
    }
  }
}

@Entity({
  name: 'user'
})
export class User extends GuidIdentity {
  @Column({
    type: 'datetime',
    nullable: true
  })
  added: Date;

  @OneToOne((type) => Account, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  public account: Account;

  @OneToMany((type) => UserRole, (userRole) => userRole.user, { cascade: true, onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  public userRoles: UserRole[];

  @Column({
    type: 'varchar',
    nullable: true
  })
  email: string;

  @Column({
    type: 'bit',
    nullable: true
  })
  email_verified: boolean = false;

  @Column({
    type: 'varchar',
    nullable: true,
    select: false
  })
  password: string;

  @Column({
    type: 'datetime',
    nullable: true
  })
  updatedAt?: Date;

  @Column({
    type: 'bit',
    nullable: true
  })
  enabled2fa?: boolean = false;

  @Column({
    type: 'varchar',
    nullable: true
  })
  secret2fa?: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  recovery_email: string;

  @Column({
    type: 'bit',
    nullable: true
  })
  recovery_email_verified: boolean = false;

  @Column({
    type: 'varchar',
    nullable: true
  })
  signup_ip_address: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  last_used_ip_address: string;

  constructor(@Req() request: Request) {
    super();
    try {
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
    } catch (err) {
      throw err;
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
  id: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  grantId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  data: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: '128'
  })
  clientId: string;

  @Column({
    type: 'datetime',
    nullable: true
  })
  expiresAt: Date;

  @Column({
    type: 'datetime',
    nullable: true
  })
  consumedAt: Date;

  @Column({
    type: 'datetime',
    nullable: true
  })
  added: Date;

  constructor() {}
}

@Entity({
  name: 'authorization_codes'
})
export class AuthorizationCode implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  id: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  grantId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  consumedAt: Date;

  constructor() {}
}

@Entity({
  name: 'client_credentials'
})
export class ClientCredential implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  consumedAt: Date;

  constructor() {}
}

@Entity({
  name: 'clients'
})
export class Client implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  consumedAt: Date;

  constructor() {}
}

@Entity({
  name: 'device_codes'
})
export class DeviceCode implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  id: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  grantId: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  userCode: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  consumedAt: Date;

  constructor() {}
}

@Entity({
  name: 'initial_access_tokens'
})
export class InitialAccessToken implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  consumedAt: Date;

  constructor() {}
}

@Entity({
  name: 'interaction'
})
export class Interaction implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  consumedAt: Date;

  constructor() {}
}

@Entity({
  name: 'refresh_tokens'
})
export class RefreshToken implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  id: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  grantId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  consumedAt: Date;

  constructor() {}
}

@Entity({
  name: 'registration_access_tokens'
})
export class RegistrationAccessToken implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  consumedAt: Date;

  constructor() {}
}

@Entity({
  name: 'replay_detection'
})
export class ReplayDetection implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  consumedAt: Date;

  constructor() {}
}

@Entity({
  name: 'pushed_authz_request'
})
export class PushedAuthorizationRequest implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  consumedAt: Date;

  constructor() {}
}

@Entity({
  name: 'sessions'
})
export class Session implements IRequiredEntityAttrs {
  @PrimaryColumn({
    type: 'varchar',
    nullable: false
  })
  id: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  grantId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 'max'
  })
  data: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  expiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  consumedAt: Date;

  constructor() {}
}

@Entity({
  name: 'token_endpoint_auth_methods'
})
export class TokenEndpointAuthMethod extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: false
  })
  type: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 1024
  })
  details: string;

  clientMetadatas: ClientMetadata;
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

  @ManyToMany((type) => GrantType, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinTable({
    name: 'client_metadata_grant_types'
  })
  public grantTypes: GrantType[];

  @OneToMany((type) => RedirectUri, (redirectUri) => redirectUri.clientMetadata, {
    cascade: true
  })
  redirectUris: RedirectUri[];

  @ManyToMany((type) => ResponseType, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinTable({
    name: 'client_metadata_response_types'
  })
  responseTypes: ResponseType[];

  @ManyToOne((type) => TokenEndpointAuthMethod, (token) => token.clientMetadatas)
  tokenEndpointAuthMethod: TokenEndpointAuthMethod;
}

@Entity({
  name: 'grant_types'
})
export class GrantType extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: false
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: false
  })
  type: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 1024
  })
  details: string;
}

@Entity({
  name: 'redirect_uris'
})
export class RedirectUri extends GuidIdentity {
  @ManyToOne((type) => ClientMetadata, (client) => client.redirectUris, {
    onDelete: 'CASCADE'
  })
  clientMetadata: ClientMetadata;

  @Column({
    type: 'varchar',
    nullable: false
  })
  url: string;
}

@Entity({
  name: 'response_types'
})
export class ResponseType extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: false
  })
  type: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 1024
  })
  details: string;
}

@Entity({
  name: 'roles'
})
export class Role extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: false
  })
  level: string;

  @Column({
    type: 'varchar',
    nullable: false
  })
  name: string;
}

@Entity({
  name: 'user_roles'
})
export class UserRole extends GuidIdentity {
  @ManyToOne((type) => Role, { eager: true })
  role: Role;

  @ManyToOne((type) => ClientMetadata, { eager: true })
  client: ClientMetadata;

  @ManyToOne((type) => User)
  user: User;
}

@Entity({
  name: 'user_logins'
})
export class UserLogin extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: true
  })
  grantId: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  email_used: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  ip_addr: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  occured_at: string;
}

@Entity({
  name: 'secret_questions'
})
export class SecretQuestion extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: false
  })
  questionText: string;
}

@Entity({
  name: 'secret_answers'
})
export class SecretAnswer extends GuidIdentity {
  @ManyToOne((type) => User, {
    onDelete: 'CASCADE'
  })
  user: User;

  @ManyToOne((type) => SecretQuestion)
  secretQuestion: SecretQuestion;

  @Column({
    type: 'varchar',
    nullable: false
  })
  answer: string;
}

@Entity({
  name: 'user_pw_reset'
})
export class UserPasswordReset extends GuidIdentity {
  @Column({
    type: 'varchar',
    nullable: true
  })
  userGuid: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  initializerIp: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  token: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  createdAt: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  expiresAt: string;

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
  @ManyToOne((type) => User, {
    onDelete: 'CASCADE'
  })
  user: User;

  @Column({
    type: 'varchar',
    nullable: false
  })
  usedPassword: string;
}

export class CommonRepo<T> extends Repository<T> {
  public async findByKeyShallow<K extends keyof T>(key: K, value: unknown) {
    const op = {
      [key]: value
    };

    return this.createQueryBuilder('entity')
      .where(`entity.${key} = :${key}`, op)
      .getOne();
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

    return this.createQueryBuilder('entity')
      .where(`entity.${key} = :${key}`, op)
      .getMany();
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
    relations.map((value, i) => {
      propNames.push(value.propertyName);
    });
    return propNames;
  }
}

@EntityRepository(ClientMetadata)
export class ClientMetadataRepo extends CommonRepo<ClientMetadata> {}

@EntityRepository(GrantType)
export class GrantTypeRepo extends CommonRepo<GrantType> {}

@EntityRepository(RedirectUri)
export class RedirectUriRepo extends CommonRepo<RedirectUri> {}

@EntityRepository(ResponseType)
export class ResponseTypeRepo extends CommonRepo<ResponseType> {}

@EntityRepository(TokenEndpointAuthMethod)
export class TokenEndpointAuthMethodRepo extends CommonRepo<TokenEndpointAuthMethod> {}

@EntityRepository(User)
export class UserRepo extends CommonRepo<User> {
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
