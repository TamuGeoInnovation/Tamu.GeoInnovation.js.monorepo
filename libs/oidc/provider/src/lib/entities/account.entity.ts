import {
  Entity,
  Column,
} from "typeorm";
import * as guid from 'uuid/v4';

import { User } from "./user.entity";
import { GuidIdentity } from "./guid-identity.entity";


@Entity({
  name: "account"
})
export class Account extends GuidIdentity implements IAccount {

  @Column({
    type: "varchar",
    nullable: true
  })
  name: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  given_name: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  family_name: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  nickname: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  profile: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  picture: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  website: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  email: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  gender: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  birthdate: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  zoneinfo: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  locale: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  phone_number: string;

  @Column({
    type: "boolean",
    nullable: true
  })
  phone_number_verified: boolean = false;

  @Column({
    type: "varchar",
    nullable: true
  })
  address: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  updated_at: string;

  @Column({
    type: "varchar",
    nullable: true
  })
  added: string;


  constructor(user: User, fullName: string, ip: string) {
    super();
    try {
      if (user) {
        if (user.guid) {
          this.guid = user.guid;
        }
        if (user.email) {
          this.email = user.email;
        }
        if (fullName) {
          this.name = fullName;
          if (fullName.includes(" ")) {
            const names: string[] = fullName.split(" ");
            this.given_name = names[0];
            this.family_name = names[1];
          }
        }
        this.updated_at = new Date().toISOString();
        this.added = new Date().toISOString();
      }
    } catch (error) {
      throw error;
    }
  }
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
  email: string;
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
