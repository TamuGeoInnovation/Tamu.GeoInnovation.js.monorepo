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
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';

import { v4 as guid } from 'uuid';

@Entity()
export class TimeStampEntity extends BaseEntity {
  @UpdateDateColumn()
  public updated: Date;

  @CreateDateColumn()
  public created: Date;
}

@Entity()
export class GuidIdentity extends TimeStampEntity {
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

@Entity({ name: 'states' })
export class State extends BaseEntity {
  @PrimaryColumn()
  public stateFips: number;

  @Column({ type: 'varchar', length: 'max' })
  public name: string;

  @Column({ type: 'varchar', length: 'max' })
  public abbreviation: string;
}

@Entity({ name: 'counties' })
export class County extends BaseEntity {
  @PrimaryColumn()
  public countyFips: number;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'stateFips' })
  public stateFips: State;

  @Column({ type: 'varchar', length: 'max' })
  public name: string;
}

@Entity({ name: 'users' })
export class User extends GuidIdentity {
  @Column({ type: 'varchar', length: 'max', select: false })
  public email: string;

  @OneToMany(() => CountyClaim, (claim) => claim.user)
  public claims: CountyClaim[];
}

@Entity({ name: 'field_categories' })
export class FieldCategory extends TimeStampEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public name: string;

  @ManyToMany(() => FieldType, (label) => label.categories, { cascade: true })
  @JoinTable()
  public types: FieldType[];

  @OneToMany(() => CategoryValue, (value) => value.category)
  public values: CategoryValue[];
}

@Entity({ name: 'field_types' })
export class FieldType extends GuidIdentity {
  @Column({ nullable: false })
  public name: string;

  @ManyToMany(() => FieldCategory, (category) => category.types)
  public categories: FieldCategory[];

  @OneToMany(() => CategoryValue, (value) => value.type)
  public values: CategoryValue[];
}

@Entity({ name: 'category_values' })
export class CategoryValue extends GuidIdentity {
  @Column({ nullable: false, type: 'varchar', length: 'max' })
  public value: string;

  @ManyToOne(() => FieldCategory, (category) => category.values)
  public category: FieldCategory;

  @ManyToOne(() => FieldType, (type) => type.values)
  public type: FieldType;
}

@Entity({ name: 'entity_values' })
export class EntityValue extends GuidIdentity {
  @OneToMany(() => EntityToValue, (entity) => entity.entityValue)
  public entityToValue: EntityToValue[];

  @OneToOne(() => CategoryValue, { cascade: true })
  @JoinColumn()
  public value: CategoryValue;
}

@Entity({ name: 'county_claims' })
export class CountyClaim extends GuidIdentity {
  @ManyToOne(() => User, (user) => user.claims, { cascade: true })
  public user: User;

  @ManyToOne(() => County, { cascade: true })
  @JoinColumn({ name: 'countyFips', referencedColumnName: 'countyFips' })
  public county: County;

  @OneToMany(() => EntityStatus, (status) => status.claimStatus, { cascade: true })
  public statuses: EntityStatus[];

  @OneToMany(() => CountyClaimInfo, (info) => info.claim, { cascade: true })
  public infos: CountyClaimInfo[];

  // Sites and lockdowns were added after schema creation.
  // Should not present a problem since the inverse was already declared

  @OneToMany(() => TestingSite, (site) => site.claim)
  public sites: TestingSite[];

  @OneToMany(() => Lockdown, (lockdown) => lockdown.claim)
  public lockdowns: Lockdown[];
}

@Entity({ name: 'county_claim_infos' })
export class CountyClaimInfo extends GuidIdentity {
  @OneToMany(() => EntityToValue, (entity) => entity.claimInfo, { cascade: true })
  public responses: EntityToValue[];

  @ManyToOne(() => CountyClaim, (claim) => claim.infos)
  @JoinColumn()
  public claim: CountyClaim;

  @OneToMany(() => EntityStatus, (status) => status.claimInfoStatus, { cascade: true })
  public statuses: EntityStatus[];
}

@Entity({ name: 'lockdowns' })
export class Lockdown extends GuidIdentity {
  @ManyToOne(() => CountyClaim, { cascade: true })
  public claim: CountyClaim;

  @OneToMany(() => LockdownInfo, (info) => info.lockdown, { cascade: true })
  public infos: LockdownInfo[];

  @OneToMany(() => EntityStatus, (status) => status.lockdownStatus, { cascade: true })
  public statuses: EntityStatus[];
}

@Entity({ name: 'locations' })
export class Location extends GuidIdentity {
  @Column({ nullable: true, type: 'varchar', length: 'max' })
  public address1: string;

  @Column({ nullable: true, type: 'varchar', length: 'max' })
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
export class LockdownInfo extends GuidIdentity {
  @OneToMany(() => EntityToValue, (entity) => entity.lockdownInfo, { cascade: true })
  public responses: EntityToValue[];

  @Column({ nullable: true })
  public isLockdown: boolean;

  @Column({ nullable: true })
  public startDate: Date;

  @Column({ nullable: true })
  public endDate: Date;

  @Column({ type: 'varchar', length: 'max', nullable: true })
  public protocol: string;

  @Column({ type: 'varchar', length: 'max', nullable: true })
  public notes: string;

  @OneToMany(() => EntityStatus, (status) => status.lockdownInfoStatus, { cascade: true })
  public statuses: EntityStatus[];

  @ManyToOne(() => Lockdown, (lockdown) => lockdown.infos)
  public lockdown: Lockdown;
}

@Entity({ name: 'testing_sites' })
export class TestingSite extends GuidIdentity {
  @ManyToOne(() => CountyClaim, { cascade: true })
  public claim: CountyClaim;

  @OneToMany(() => TestingSiteInfo, (info) => info.testingSite, { cascade: true })
  public infos: TestingSiteInfo[];

  @OneToMany(() => EntityStatus, (status) => status.testingSiteStatus, { cascade: true })
  public statuses: EntityStatus[];
}

@Entity({ name: 'testing_site_infos' })
export class TestingSiteInfo extends GuidIdentity {
  @OneToMany(() => EntityToValue, (entity) => entity.testingSiteInfo, { cascade: true })
  public responses: EntityToValue[];

  @Column({ nullable: true })
  public undisclosed: boolean;

  @Column({ nullable: true })
  public sitesAvailable: boolean;

  @OneToOne(() => Location, { cascade: true })
  @JoinColumn()
  public location: Location;

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

  @Column({ type: 'varchar', length: 'max', nullable: true })
  public notes: string;

  @OneToMany(() => EntityStatus, (status) => status.testingSiteInfoStatus, { cascade: true })
  public statuses: EntityStatus[];

  @ManyToOne(() => TestingSite, (testingSite) => testingSite.infos)
  public testingSite: TestingSite;
}

@Entity({ name: 'entity_to_values' })
export class EntityToValue extends GuidIdentity {
  @ManyToOne(() => EntityValue, (value) => value.entityToValue, { cascade: true })
  public entityValue: EntityValue;

  @ManyToOne(() => CountyClaimInfo, (value) => value.responses)
  public claimInfo: CountyClaimInfo;

  @ManyToOne(() => LockdownInfo, (value) => value.responses)
  public lockdownInfo: LockdownInfo;

  @ManyToOne(() => TestingSiteInfo, (value) => value.responses)
  public testingSiteInfo: TestingSiteInfo;
}

@Entity({ name: 'status_types' })
export class StatusType extends TimeStampEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;
}

@Entity({ name: 'entity_statuses' })
export class EntityStatus extends GuidIdentity {
  @ManyToOne(() => StatusType)
  public type: StatusType;

  @ManyToOne(() => CountyClaim, (claim) => claim.statuses)
  public claimStatus: CountyClaim;

  @ManyToOne(() => CountyClaimInfo, (info) => info.statuses)
  public claimInfoStatus: CountyClaimInfo;

  @ManyToOne(() => LockdownInfo, (info) => info.statuses)
  public lockdownInfoStatus: LockdownInfo;

  @ManyToOne(() => Lockdown, (info) => info.statuses)
  public lockdownStatus: Lockdown;

  @ManyToOne(() => TestingSiteInfo, (info) => info.statuses)
  public testingSiteInfoStatus: TestingSiteInfo;

  @ManyToOne(() => TestingSite, (info) => info.statuses)
  public testingSiteStatus: Lockdown;
}
