import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeUpdate,
  BeforeInsert,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne
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

@Entity()
export class LocationEntity extends CovidBase {
  @Column({ nullable: true })
  public address1: string;

  @Column({ nullable: true })
  public address2: string;

  @Column({ nullable: true })
  public county: string;

  @Column({ nullable: true })
  public state: string;

  @Column({ nullable: true })
  public zip: string;

  @Column({ nullable: true })
  public country: string;

  @Column({ nullable: true })
  public latitude: string;

  @Column({ nullable: true })
  public longitude: string;
}

@Entity({ name: 'users' })
export class User extends CovidBase {
  @Column()
  public email: string;

  @OneToMany((type) => Source, (source) => source.user)
  public sources: Source[];

  @OneToMany((type) => TestingSite, (site) => site.user)
  public testing_sites: TestingSite[];

  @OneToMany((type) => Lockdown, (lockdown) => lockdown.user)
  public lockdowns: Lockdown[];
}

/**
 * Entity that describes the type of a given source.
 *
 * For example: new website, government website, social media, etc
 */
@Entity({ name: 'source_types' })
export class SourceType extends CovidBase {
  @Column()
  public type: string;
}

@Entity({ name: 'sources' })
export class Source extends CovidBase {
  @Column({ nullable: true })
  public url: string;

  @OneToOne((type) => SourceType, { cascade: true })
  @JoinColumn()
  public sourceType: SourceType;

  @ManyToOne((type) => User, (user) => user.sources)
  public user: User;
}

@Entity()
export class Submission extends LocationEntity {
  @Column({ type: 'text', nullable: true })
  public notes: string;

  @OneToOne((type) => Source, { cascade: true })
  @JoinColumn()
  public source: Source;
}

@Entity({ name: 'testing_sites' })
export class TestingSite extends Submission {
  @Column({ nullable: true })
  public operationStartTime: string;

  @Column({ nullable: true })
  public operationEndTime: string;

  @ManyToOne((type) => User, (user) => user.testing_sites, { cascade: true })
  public user: User;
}

@Entity({ name: 'validated_testing_sites' })
export class ValidatedTestingSite extends CovidBase {
  @OneToOne((type) => TestingSite, { onDelete: 'CASCADE' })
  @JoinColumn()
  public testing_site: TestingSite;
}

@Entity({ name: 'lockdowns' })
export class Lockdown extends Submission {
  @Column({ nullable: true })
  public startDate: Date;

  @Column({ nullable: true })
  public endDate: Date;

  @Column({ type: 'text', nullable: true })
  public protocol: string;

  @ManyToOne((type) => User, (user) => user.lockdowns)
  public user: User;
}

@Entity({ name: 'validated_lockdowns' })
export class ValidatedLockdown extends CovidBase {
  @OneToOne((type) => Lockdown, { onDelete: 'CASCADE' })
  @JoinColumn()
  public lockdown: Lockdown;
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
}
