import {
  Entity,
  BaseEntity,
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

import { Multer } from 'multer';
import { v4 as guid } from 'uuid';

@Entity()
export class GISDayCompetitionBaseEntity extends BaseEntity {
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

@Entity({
  name: 'submissions_locations'
})
export class SubmissionLocation extends GISDayCompetitionBaseEntity implements ICompetitionSubmissionLocation {
  @Column({ type: 'decimal', precision: 5 })
  public latitude: number;

  @Column({ type: 'decimal', precision: 5 })
  public longitude: number;

  @Column({ type: 'decimal', precision: 2 })
  public accuracy: number;

  @Column({ type: 'decimal', precision: 2, nullable: true })
  public altitude?: number;

  @Column({ type: 'decimal', precision: 2, nullable: true })
  public altitudeAccuracy?: number;

  @Column({ type: 'decimal', precision: 2, nullable: true })
  public heading?: number;

  @Column({ type: 'decimal', precision: 2, nullable: true })
  public speed?: number;
}

@Entity({
  name: 'forms'
})
export class CompetitionForm extends GISDayCompetitionBaseEntity implements ICompetitionSeasonForm {
  @Column()
  public source: string;

  @Column({ type: 'simple-json', nullable: false })
  public model: string;
}

@Entity({
  name: 'seasons'
})
export class CompetitionSeason extends GISDayCompetitionBaseEntity implements ICompetitionSeason {
  @Column()
  public year: string;

  @OneToOne(() => CompetitionForm, { cascade: true, nullable: true })
  @JoinColumn()
  public form?: CompetitionForm;
}

@Entity({
  name: 'submissions'
})
export class CompetitionSubmission extends GISDayCompetitionBaseEntity implements ICompetitionSubmission {
  @Column()
  public userGuid: string;

  // JSON.stringify()'d values stored in a single field
  @Column({ type: 'simple-json', nullable: false })
  public value: string;

  @OneToOne(() => SubmissionLocation, { cascade: true })
  @JoinColumn()
  public location: SubmissionLocation;

  @ManyToOne(() => CompetitionSeason, { cascade: true })
  public season: CompetitionSeason;

  @OneToMany(() => SubmissionMedia, (s) => s.blob, { cascade: true })
  public blobs?: SubmissionMedia[];
}

@Entity({
  name: 'submissions_media'
})
export class SubmissionMedia extends GISDayCompetitionBaseEntity implements ISubmissionMedia {
  @ManyToOne(() => CompetitionSubmission, (s) => s.blobs)
  public submission: CompetitionSubmission;

  @Column({ type: 'image', nullable: false })
  public blob: File;

  @Column({ type: 'nvarchar', length: 32, nullable: true })
  public mimeType?: string;

  @Column({ type: 'nvarchar', nullable: true })
  public fieldName?: string;
}

export interface ICompetitionSubmission {
  userGuid: string;
  value: string;
  season: ICompetitionSeason;
  blobs?: ISubmissionMedia[];
}

export interface ISubmissionMedia {
  submission?: CompetitionSubmission;
  blob: File;
  mimeType?: string;
  fieldName?: string;
}
export interface ICompetitionSubmissionLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: Date;
}

export interface ICompetitionSeason {
  year: string;
  form?: CompetitionForm;
}

export interface ICompetitionSeasonForm {
  source: string;
  model: string;
}
