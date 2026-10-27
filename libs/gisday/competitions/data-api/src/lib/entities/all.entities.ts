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
  JoinColumn
} from 'typeorm';


import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { COMPETITION_VALIDATION_STATUS } from '@tamu-gisc/gisday/common';

@Entity()
export class GISDayCompetitionBaseEntity extends BaseEntity {
  @PrimaryColumn()
  public guid: string;

  @UpdateDateColumn({ type: 'datetimeoffset' })
  public updated: Date;

  @CreateDateColumn({ type: 'datetimeoffset' })
  public created: Date;

  @BeforeUpdate()
  @BeforeInsert()
  private generateGuid(): void {
    if (this.guid === undefined) {
      this.guid = crypto.randomUUID();
    }
  }
}

@Entity({
  name: 'vgi_submissions_locations'
})
export class SubmissionLocation extends GISDayCompetitionBaseEntity implements ICompetitionSubmissionLocation {
  @Column({ type: 'decimal', precision: 7, scale: 5 })
  public latitude: number;

  @Column({ type: 'decimal', precision: 8, scale: 5 })
  public longitude: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  public accuracy: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  public altitude?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  public altitudeAccuracy?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  public heading?: number;

  @Column({ type: 'decimal', precision: 6, scale: 3, nullable: true })
  public speed?: number;
}

@Entity({
  name: 'vgi_forms'
})
export class CompetitionForm extends GISDayCompetitionBaseEntity implements ICompetitionSeasonForm {
  @Column()
  public source: string;

  @Column({ type: 'simple-json', nullable: false })
  public model: Array<ICompetitionSeasonFormQuestion>;
}

@Entity({
  name: 'vgi_seasons'
})
export class CompetitionSeason extends GISDayCompetitionBaseEntity implements ICompetitionSeason {
  @Column({ default: false })
  public allowSubmissions: boolean;

  @OneToOne(() => Season, { cascade: true, nullable: true, orphanedRowAction: 'nullify', onDelete: 'SET NULL' })
  @JoinColumn()
  public season: Season;

  @OneToOne(() => CompetitionForm, { cascade: true, nullable: true })
  @JoinColumn()
  public form?: CompetitionForm;
}

@Entity({
  name: 'vgi_submission_validation_status'
})
export class CompetitionSubmissionValidationStatus extends GISDayCompetitionBaseEntity {
  @Column({ default: COMPETITION_VALIDATION_STATUS.unverified })
  public status: string;

  @Column()
  public verifiedBy: string;
}

@Entity({
  name: 'vgi_submissions'
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

  @OneToMany(() => SubmissionMedia, (s) => s.submission, { cascade: true })
  public blobs?: SubmissionMedia[];

  @OneToOne(() => CompetitionSubmissionValidationStatus, { cascade: true })
  @JoinColumn()
  public validationStatus: CompetitionSubmissionValidationStatus;
}

@Entity({
  name: 'vgi_submissions_media'
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

  @Column({ type: 'char', length: 64, nullable: true })
  public sha256?: string;
}

export interface ICompetitionSubmission {
  guid: string;
  updated: Date;
  created: Date;
  userGuid: string;
  value: string;
  location: SubmissionLocation;
  season: ICompetitionSeason;
  blobs?: ISubmissionMedia[];
  validationStatus: CompetitionSubmissionValidationStatus;
}

export interface ICompetitionSubmissionValidationStatus extends CompetitionSubmissionValidationStatus {
  status: COMPETITION_VALIDATION_STATUS;
  validatedBy: string;
}

export interface ISubmissionMedia {
  submission?: CompetitionSubmission;
  blob: File;
  mimeType?: string;
  fieldName?: string;
  sha256?: string;
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
  season: Season;
  form?: CompetitionForm;
}

export interface ICompetitionSeasonForm {
  source: string;
  model: Array<ICompetitionSeasonFormQuestion>;
}

export interface ICompetitionSeasonFormQuestion {
  attribute: string;
  title: string;
  instructions: string;
  enabled: boolean;
  isDiscriminator?: boolean;
  options?: Array<ICompetitionSeasonFormOption>;
  type: string;
}

/**
 * An answer to a question. On the type question, the optional settings say how leaderboard scoring
 * tells one thing of this type from another (#2162); they come from the form schema's coded values.
 */
export interface ICompetitionSeasonFormOption {
  name: string;
  value: string | number | boolean;
  /**
   * How close an earlier new find of this type must be to count as the same thing. Without it,
   * `SAME_THING_DISTANCE_METRES`.
   */
  sameThingMetres?: number;
  /**
   * The text question holding the thing's name. When set, two finds of this type within
   * `sameThingMetres` are the same thing only if their names match, so neighbouring things with
   * different names score as new. A find without a name is compared by distance alone.
   */
  nameAttribute?: string;
  /**
   * The answers in the previous competition season's type question that this type continues, and how
   * close one of them must be to count as already found. Without it, nothing from that season counts.
   */
  earlier?: {
    values: Array<string | number | boolean>;
    metres: number;
  };
}

export const GISDAY_COMPETITIONS_ENTITIES = [
  SubmissionLocation,
  CompetitionForm,
  CompetitionSeason,
  CompetitionSubmission,
  CompetitionSubmissionValidationStatus,
  SubmissionMedia
];
