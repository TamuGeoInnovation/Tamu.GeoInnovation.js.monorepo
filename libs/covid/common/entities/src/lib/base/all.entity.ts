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
  JoinColumn
} from 'typeorm';

import * as guid from 'uuid/v4';

@Entity()
export class BaseIdentifiableEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  public id: number;

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
export class SubmissionEntity extends BaseIdentifiableEntity {
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

  @Column({ type: 'text', nullable: true })
  public notes: string;
}

@Entity({ name: 'testing_sites' })
export class TestingSite extends SubmissionEntity {
  @Column({ nullable: true })
  public operationStartTime: string;

  @Column({ nullable: true })
  public operationEndTime: string;
}

@Entity({ name: 'validated_testing_sites' })
export class ValidatedTestingSite extends BaseIdentifiableEntity {
  @OneToOne((type) => TestingSite, { onDelete: 'CASCADE' })
  @JoinColumn()
  public testing_site: TestingSite;
}

@Entity({ name: 'lockdowns' })
export class Lockdown extends SubmissionEntity {
  @Column({ nullable: true })
  public startDate: Date;

  @Column({ nullable: true })
  public endDate: Date;

  @Column({ type: 'text', nullable: true })
  public procedure: string;
}

@Entity({ name: 'validated_lockdowns' })
export class ValidatedLockdown extends BaseIdentifiableEntity {
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
