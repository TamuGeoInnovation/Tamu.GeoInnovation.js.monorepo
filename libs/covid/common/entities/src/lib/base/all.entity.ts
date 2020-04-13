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

import * as guid from 'uuid/v4';

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

  @Column()
  public stateFips: number;

  @Column({ type: 'varchar', length: 'max' })
  public name: string;
}

@Entity({ name: 'users' })
export class User extends GuidIdentity {
  @Column({ type: 'varchar', length: 'max', select: false })
  public email: string;

  @OneToMany((type) => CountyClaim, (claim) => claim.user)
  public claims: CountyClaim[];
}

@Entity({ name: 'field_categories' })
export class FieldCategory extends TimeStampEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public name: string;

  @ManyToMany((type) => FieldType, (label) => label.categories, { cascade: true })
  @JoinTable()
  public types: FieldType[];

  @OneToMany((type) => CategoryValue, (value) => value.category)
  public values: CategoryValue[];
}

@Entity({ name: 'field_types' })
export class FieldType extends GuidIdentity {
  @Column({ nullable: false })
  public name: string;

  @ManyToMany((type) => FieldCategory, (category) => category.types)
  public categories: FieldCategory[];

  @OneToMany((type) => CategoryValue, (value) => value.type)
  public values: CategoryValue[];
}

@Entity({ name: 'category_values' })
export class CategoryValue extends GuidIdentity {
  @Column({ nullable: false, type: 'varchar', length: 'max' })
  public value: string;

  @ManyToOne((type) => FieldCategory, (category) => category.values)
  public category: FieldCategory;

  @ManyToOne((type) => FieldType, (type) => type.values)
  public type: FieldType;
}

@Entity({ name: 'entity_values' })
export class EntityValue extends GuidIdentity {
  @OneToMany((type) => EntityToValue, (entity) => entity.entityValue)
  public entityToValue: EntityToValue[];

  @OneToOne((type) => CategoryValue, { cascade: true })
  @JoinColumn()
  public value: CategoryValue;
}

@Entity({ name: 'county_claims' })
export class CountyClaim extends GuidIdentity {
  @ManyToOne((type) => User, (user) => user.claims, { cascade: true })
  public user: User;

  @ManyToOne((type) => County, { cascade: true })
  @JoinColumn({ name: 'countyFips', referencedColumnName: 'countyFips' })
  public county: County;

  @OneToMany((type) => EntityStatus, (status) => status.claimStatus, { cascade: true })
  public statuses: EntityStatus[];

  @OneToMany((type) => CountyClaimInfo, (info) => info.claim, { cascade: true })
  public infos: CountyClaimInfo[];
}

@Entity({ name: 'county_claim_infos' })
export class CountyClaimInfo extends GuidIdentity {
  @OneToMany((type) => EntityToValue, (entity) => entity.claimInfo, { cascade: true })
  public responses: EntityToValue[];

  @ManyToOne((type) => CountyClaim, (claim) => claim.infos)
  @JoinColumn()
  public claim: CountyClaim;

  @OneToMany((type) => EntityStatus, (status) => status.claimInfoStatus, { cascade: true })
  public statuses: EntityStatus[];
}

@Entity({ name: 'entity_to_values' })
export class EntityToValue extends GuidIdentity {
  @ManyToOne((type) => EntityValue, (value) => value.entityToValue, { cascade: true })
  public entityValue: EntityValue;

  @ManyToOne((type) => CountyClaimInfo, (value) => value.responses)
  public claimInfo: CountyClaimInfo;
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
  @ManyToOne((type) => StatusType)
  public type: StatusType;

  @ManyToOne((type) => CountyClaim, (claim) => claim.statuses)
  public claimStatus: CountyClaim;

  @ManyToOne((type) => CountyClaimInfo, (info) => info.statuses)
  public claimInfoStatus: CountyClaimInfo;
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

@Entity({ name: 'testing_site_infos' })
export class TestingSiteInfo extends GuidIdentity {
  @Column({ nullable: true })
  public undisclosed: boolean;

  @Column({ nullable: true })
  public sitesAvailable: boolean;

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

}

@Entity({ name: 'testing_sites' })
export class TestingSite extends GuidIdentity {
  @ManyToOne((type) => CountyClaim, { cascade: true })
  public claim: CountyClaim;

  @OneToOne((type) => Location, { cascade: true })
  @JoinColumn()
  public location: Location;

  @OneToOne((type) => TestingSiteInfo, { cascade: true })
  @JoinColumn()
  public info: TestingSiteInfo;
}

@Entity({ name: 'site_status_types' })
export class SiteStatusType extends GuidIdentity {
  @Column()
  public name: string;
}

@Entity({ name: 'site_statuses' })
export class SiteStatus extends GuidIdentity {
  @ManyToOne((type) => SiteStatusType, { cascade: true })
  public type: SiteStatusType;

  @ManyToOne((type) => TestingSiteInfo)
  public testingSiteInfo: TestingSiteInfo;
}

// @Entity({ name: 'website_types' })
// export class WebsiteType extends GuidIdentity {
//   @Column()
//   public name: string;
// }

// @Entity({ name: 'websites' })
// export class Website extends GuidIdentity {
//   @Column({ nullable: true, type: 'varchar', length: 'max' })
//   public url: string;

//   @ManyToOne((type) => WebsiteType, { cascade: true })
//   public type: WebsiteType;

//   // @ManyToOne((type) => CountyClaimInfo, (info) => info.websites)
//   // public claimInfo: County;

//   @ManyToOne((type) => LockdownInfo, (lockdown) => lockdown.websites)
//   public lockdownInfo: LockdownInfo;

//   @ManyToOne((type) => TestingSiteInfo, (site) => site.websites)
//   public testingSiteInfo: TestingSiteInfo;
// }

// @Entity({ name: 'phone_number_types' })
// export class PhoneNumberType extends GuidIdentity {
//   @Column()
//   public name: string;
// }
// @Entity({ name: 'phone_numbers' })
// export class PhoneNumber extends GuidIdentity {
//   @Column()
//   public number: string;

//   @ManyToOne((type) => PhoneNumberType, { cascade: true })
//   public type: PhoneNumberType;

//   // @ManyToOne((type) => CountyClaimInfo, (info) => info.phoneNumbers)
//   // public claimInfo: CountyClaimInfo;

//   @ManyToOne((type) => LockdownInfo, (lockdown) => lockdown.phoneNumbers)
//   public lockdownInfo: LockdownInfo;

//   @ManyToOne((type) => TestingSiteInfo, (site) => site.phoneNumbers)
//   public testingSiteInfo: TestingSiteInfo;
// }

// @Entity({ name: 'restriction_types' })
// export class RestrictionType extends GuidIdentity {
//   @Column()
//   public name: string;
// }

// @Entity({ name: 'restrictions' })
// export class Restriction extends GuidIdentity {
//   @ManyToOne((type) => RestrictionType, { cascade: true })
//   public type: RestrictionType;

//   @ManyToOne((type) => TestingSiteInfo, (info) => info.restrictions)
//   public testingSiteInfo: TestingSiteInfo;
// }

// @Entity({ name: 'site_owner_types' })
// export class SiteOwnerType extends GuidIdentity {
//   @Column()
//   public name: string;
// }

// @Entity({ name: 'site_owners' })
// export class SiteOwner extends GuidIdentity {
//   @ManyToOne((type) => SiteOwnerType, { cascade: true })
//   public type: SiteOwnerType;

//   @ManyToOne((type) => TestingSiteInfo, (info) => info.owners)
//   public testingSiteInfo: TestingSiteInfo;
// }

// @Entity({ name: 'site_service_types' })
// export class SiteServiceType extends GuidIdentity {
//   @Column()
//   public name: string;
// }

// @Entity({ name: 'site_services' })
// export class SiteService extends GuidIdentity {
//   @ManyToOne((type) => SiteServiceType, { cascade: true })
//   public type: SiteServiceType;

//   @ManyToOne((type) => TestingSiteInfo, (info) => info.services)
//   public testingSiteInfo: TestingSiteInfo;
// }



@Entity({ name: 'lockdown_statuses' })
export class LockdownStatus extends GuidIdentity {
  @Column({ default: false, select: false })
  public flagged: boolean;

  @Column({ default: false, select: false })
  public validated: boolean;
  
}

@Entity({ name: 'lockdown_infos' })
export class LockdownInfo extends GuidIdentity {
  @OneToMany((type) => EntityToValue, (entity) => entity.claimInfo, { cascade: true })
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
  
  @OneToMany((type) => EntityStatus, (status) => status.claimInfoStatus, { cascade: true })
  public statuses: EntityStatus[];

  // @OneToMany((type) => PhoneNumber, (ph) => ph.lockdownInfo, { cascade: true })
  // public phoneNumbers: PhoneNumber[];

  // @OneToMany((type) => Website, (wb) => wb.lockdownInfo, { cascade: true })
  // public websites: Website[];
}

@Entity({ name: 'lockdowns' })
export class Lockdown extends GuidIdentity {
  @ManyToOne((type) => CountyClaim, { cascade: true })
  public claim: CountyClaim;

  @OneToOne((type) => Location, { cascade: true })
  @JoinColumn()
  public location: Location;

  @OneToOne((type) => LockdownInfo, { cascade: true })
  @JoinColumn()
  public infos: LockdownInfo[];
}
