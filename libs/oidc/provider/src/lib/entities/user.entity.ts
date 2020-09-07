import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinTable,
  JoinColumn,
  OneToOne,
} from "typeorm";
import * as Koa from "koa";

import { Account } from "./account.entity";
import { GuidIdentity } from "./guid-identity.entity";

@Entity({
  name: "user",
})
export class User extends GuidIdentity {
  // @PrimaryGeneratedColumn()
  // id: number;

  @Column({
    type: "text",
    nullable: true,
  })
  added: string;

  @OneToOne((type) => Account, { cascade: true })
  @JoinColumn()
  public account: Account;

  // @Column({
  //   type: "varchar",
  //   nullable: true,
  // })
  // guid: string = v4();

  @Column({
    type: "varchar",
    nullable: true,
  })
  email: string;

  @Column({
    type: "boolean",
    nullable: true,
  })
  email_verified: boolean = false;

  @Column({
    type: "varchar",
    nullable: true,
  })
  password: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  updatedAt?: string;

  @Column({
    type: "boolean",
    nullable: true,
  })
  enabled2fa?: boolean = false;

  @Column({
    type: "varchar",
    nullable: true,
  })
  secret2fa?: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  recovery_email: string;

  @Column({
    type: "boolean",
    nullable: true,
  })
  recovery_email_verified: boolean = false;

  @Column({
    type: "varchar",
    nullable: true,
  })
  signup_ip_address: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  last_used_ip_address: string;

  constructor(request: Koa.Request) {
    super();
    try {
      if (request) {
        if (request.body) {
          const body = request.body;
          if (body.login) {
            this.email = body.login;
          }
          if (body.password) {
            this.password = body.password;
          }
          if (body.ip) {
            this.signup_ip_address = body.ip;
            this.last_used_ip_address = body.ip;
          }
          this.updatedAt = new Date().toISOString();
          this.added = new Date().toISOString();
        }
      }

    } catch (err) {
      throw err;
    }
  }
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
