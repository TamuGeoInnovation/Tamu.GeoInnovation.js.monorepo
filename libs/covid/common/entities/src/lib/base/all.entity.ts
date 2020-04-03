import {
  Entity,
  BaseEntity,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeUpdate,
  BeforeInsert,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable
} from 'typeorm';

import * as guid from 'uuid/v4';

@Entity()
export class CovidBase extends BaseEntity {
  @PrimaryColumn()
  public guid: string;

  @UpdateDateColumn()
  public updated: Date;

  @CreateDateColumn()
  public created: Date;

  @BeforeUpdate()
  @BeforeInsert()
  private generateGuid(): void {
    if (this.guid === undefined) {
      this.guid = guid();
    }
  }
}

@Entity({ name: 'users' })
export class User extends CovidBase {
  @Column({ type: 'text', select: false })
  public email: string;

  @OneToMany((type) => CountyClaim, (claim) => claim.user, { cascade: true })
  public claims: CountyClaim[];
}

@Entity({ name: 'states' })
export class State extends BaseEntity {
  @PrimaryColumn()
  public stateFips: number;

  @Column({ type: 'text' })
  public name: string;

  @Column({ type: 'text' })
  public abbreviation: string;
}

@Entity({ name: 'counties' })
export class County extends BaseEntity {
  @PrimaryColumn()
  public countyFips: number;

  @Column()
  public stateFips: number;

  @Column({ type: 'text' })
  public name: string;

  @OneToMany((type) => PhoneNumber, (phoneNumber) => phoneNumber.county, { cascade: true })
  public phoneNumbers: PhoneNumber[];
}

@Entity({ name: 'county_claims' })
export class CountyClaim extends CovidBase {
  @Column({ nullable: true })
  public processing: boolean;

  @Column({ nullable: true })
  public closed: boolean;

  @ManyToOne((type) => User, (user) => user.claims)
  public user: User;

  @ManyToOne((type) => County, { cascade: true })
  @JoinColumn({ referencedColumnName: 'countyFips' })
  public county: County;
}

@Entity({ name: 'locations' })
export class Location extends CovidBase {
  @Column({ nullable: true, type: 'text' })
  public address1: string;

  @Column({ nullable: true, type: 'text' })
  public address2: string;

  @Column({ nullable: true })
  public city: string;

  @Column({ nullable: true })
  public zip: string;

  @Column({ nullable: true })
  public county: string;

  @Column({ nullable: true })
  public state: string;

  @Column({ nullable: true })
  public country: string;

  @Column({ nullable: true })
  public latitude: number;

  @Column({ nullable: true })
  public longitude: number;
}

@Entity({ name: 'lockdown_infos' })
export class LockdownInfo extends CovidBase {
  @Column({ nullable: true })
  public isLockdown: boolean;

  @Column({ nullable: true })
  public startDate: Date;

  @Column({ nullable: true })
  public endDate: Date;

  @Column({ type: 'text', nullable: true })
  public protocol: string;

  @Column({ type: 'text', nullable: true })
  public notes: string;

  @OneToMany((type) => PhoneNumber, (ph) => ph.lockdownInfo, { cascade: true })
  public phoneNumbers: PhoneNumber[];

  @OneToMany((type) => Website, (wb) => wb.lockdownInfo, { cascade: true })
  public websites: Website[];
}

@Entity({ name: 'website_types' })
export class WebsiteType extends CovidBase {
  @Column()
  public name: string;
}

@Entity({ name: 'websites' })
export class Website extends CovidBase {
  @Column({ nullable: true, type: 'text' })
  public url: string;

  @ManyToOne((type) => WebsiteType, { cascade: true })
  public type: WebsiteType;

  @ManyToOne((type) => LockdownInfo, (lockdown) => lockdown.websites)
  public lockdownInfo: LockdownInfo;
}

@Entity({ name: 'phone_number_types' })
export class PhoneNumberType extends CovidBase {
  @Column()
  public name: string;
}
@Entity({ name: 'phone_numbers' })
export class PhoneNumber extends CovidBase {
  @Column()
  public number: string;

  @ManyToOne((type) => PhoneNumberType, { cascade: true })
  public type: PhoneNumberType;

  @ManyToOne((type) => County, (county) => county.phoneNumbers)
  public county: County;

  @ManyToOne((type) => LockdownInfo, (lockdown) => lockdown.phoneNumbers)
  public lockdownInfo: LockdownInfo;
}

@Entity({ name: 'restrictions' })
export class Restriction extends CovidBase {
  @Column()
  public type: string;
}

@Entity({ name: 'site_owners' })
export class SiteOwner extends CovidBase {
  @Column()
  public type: string;
}

@Entity({ name: 'site_statuses' })
export class SiteStatus extends CovidBase {
  @Column()
  public type: string;
}

@Entity({ name: 'site_services' })
export class SiteService extends CovidBase {
  @Column()
  public type: string;
}

@Entity({ name: 'testing_sites' })
export class TestingSite extends Location {
  @Column({ nullable: true })
  public locationName: string;

  @Column({ nullable: true })
  public locationPhoneNumber: string;

  @Column({ nullable: true })
  public hoursOfOperation: string;

  @Column({ nullable: true })
  public capacity: number;

  @Column({ nullable: true })
  public driveThrough: boolean;

  @Column({ nullable: true })
  public driveThroughCapacity: number;

  @Column({ type: 'text', nullable: true })
  public notes: string;

  @ManyToMany((type) => SiteOwner)
  @JoinTable()
  public owners: SiteOwner[];

  @ManyToMany((type) => SiteService)
  @JoinTable()
  public services: SiteService[];

  @ManyToOne((type) => SiteStatus, { cascade: true })
  public status: SiteStatus;

  @OneToOne((type) => Website, { cascade: true })
  @JoinColumn()
  public source: Website;

  @ManyToMany((type) => Restriction)
  @JoinTable()
  public restrictions: Restriction[];
}

@Entity({ name: 'lockdown_statuses' })
export class LockdownStatus extends CovidBase {
  @Column({ default: false, select: false })
  public flagged: boolean;

  @Column({ default: false, select: false })
  public validated: boolean;
}

@Entity({ name: 'lockdowns' })
export class Lockdown extends CovidBase {
  @ManyToOne((type) => State, { cascade: true })
  public state: State;

  @ManyToOne((type) => County, { cascade: true })
  public county: County;

  @ManyToOne((type) => CountyClaim, { cascade: true })
  public claim: CountyClaim;

  @OneToOne((type) => Location, { cascade: true })
  @JoinColumn()
  public location: Location;

  @OneToOne((type) => LockdownInfo, { cascade: true })
  @JoinColumn()
  public info: LockdownInfo;

  @OneToOne((type) => LockdownStatus, { cascade: true })
  @JoinColumn()
  public status: LockdownStatus;
}
