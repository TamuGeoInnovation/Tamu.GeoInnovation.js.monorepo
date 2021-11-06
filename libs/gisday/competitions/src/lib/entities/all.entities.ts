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
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';

import { v4 as guid } from 'uuid';

@Entity()
export class GISDayCompetitionBaseEntity extends BaseEntity {
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
export class CompetitionSubmission extends GISDayCompetitionBaseEntity {}

@Entity()
export class SubmissionGeography extends GISDayCompetitionBaseEntity {}

export interface ICompetitionSubmission {}
