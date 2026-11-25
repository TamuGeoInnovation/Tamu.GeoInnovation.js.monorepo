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

import { Season, TIMESTAMP_COLUMN } from '@tamu-gisc/gisday/platform/data-api';

import { COMPETITION_VALIDATION_STATUS } from '@tamu-gisc/gisday/common';

@Entity()
export class GISDayCompetitionBaseEntity extends BaseEntity {
  @PrimaryColumn()
  public guid: string;

  // The server's clock with its offset, not getdate() (#2926): see TIMESTAMP_COLUMN.
  @UpdateDateColumn(TIMESTAMP_COLUMN)
  public updated: Date;

  @CreateDateColumn(TIMESTAMP_COLUMN)
  public created: Date;

  @BeforeUpdate()
  @BeforeInsert()
  private generateGuid(): void {
    // Typed as always set, but empty before the first save.
    if (!this.guid) {
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

  /**
   * When the season's submissions start counting for scoring (#2474). Empty for no limit on that side.
   */
  @Column({ type: 'datetimeoffset', nullable: true })
  public scoringOpensAt?: Date | null;

  /**
   * When they stop: a submission made at this moment or later does not count (#2474). Empty for no limit.
   */
  @Column({ type: 'datetimeoffset', nullable: true })
  public scoringClosesAt?: Date | null;

  // Null once its GIS Day season is deleted.
  @OneToOne(() => Season, { cascade: true, nullable: true, orphanedRowAction: 'nullify', onDelete: 'SET NULL' })
  @JoinColumn()
  public season: Season | null;

  @OneToOne(() => CompetitionForm, { cascade: true, nullable: true })
  @JoinColumn()
  public form?: CompetitionForm | null;
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

  // The answers, keyed by question, stored as JSON in a single field and read back parsed. They are the JSON the app
  // sent, so they are typed as possibly null, as JSON can be.
  @Column({ type: 'simple-json', nullable: false })
  public value: Partial<Record<string, SubmissionAnswer>> | null;

  // The relations below are nullable columns, as TypeORM makes a relation by default.
  @OneToOne(() => SubmissionLocation, { cascade: true })
  @JoinColumn()
  public location: SubmissionLocation | null;

  @ManyToOne(() => CompetitionSeason, { cascade: true })
  public season: CompetitionSeason | null;

  @OneToMany(() => SubmissionMedia, (s) => s.submission, { cascade: true })
  public blobs?: SubmissionMedia[];

  @OneToOne(() => CompetitionSubmissionValidationStatus, { cascade: true })
  @JoinColumn()
  public validationStatus: CompetitionSubmissionValidationStatus | null;
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
  value: Partial<Record<string, SubmissionAnswer>> | null;
  location: SubmissionLocation | null;
  season: ICompetitionSeason | null;
  blobs?: ISubmissionMedia[];
  validationStatus: CompetitionSubmissionValidationStatus | null;
}

/**
 * One answer in a submission, as the app sent it: a form field holds text, a number or yes/no, and a question may take
 * several. Typed from the forms, not checked: it is JSON a participant's app sent, and a question may be unanswered.
 */
export type SubmissionAnswer = string | number | boolean | null | Array<string | number | boolean | null>;

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
  season: Season | null;
  form?: CompetitionForm | null;
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
  /**
   * The automatic review's limits for a find of this type (#2430), any of them. Without one, its default
   * (`DEFAULT_REVIEW_LIMITS`, 2026's), so a form that sets none is reviewed as before.
   */
  review?: Partial<ReviewLimits>;
}

/**
 * What the automatic review accepts without a person looking (#2164, #2430): how accurate a location must be, how many
 * submissions one participant may make how quickly, and the areas a find must be in.
 */
export interface ReviewLimits {
  /** The worst location accuracy, in metres. */
  maxAccuracyMetres: number;
  /** This many submissions, this one included, within `paceSeconds` is too quick. */
  paceSubmissions: number;
  paceSeconds: number;
  /** A find must be inside one of these. */
  areas: Array<{ name: string; corners: Array<{ latitude: number; longitude: number }> }>;
}

export const GISDAY_COMPETITIONS_ENTITIES = [
  SubmissionLocation,
  CompetitionForm,
  CompetitionSeason,
  CompetitionSubmission,
  CompetitionSubmissionValidationStatus,
  SubmissionMedia
];
