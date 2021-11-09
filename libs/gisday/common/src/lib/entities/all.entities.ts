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

import { Multer } from 'multer';
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

  @Column({ nullable: true })
  public timestamp?: Date;
}

@Entity({
  name: 'submissions'
})
export class CompetitionSubmission extends GISDayCompetitionBaseEntity {
  @Column()
  public userGuid: string;

  // JSON.stringify()'d values stored in a single field
  @Column({ type: 'simple-json', nullable: false })
  public value: string;

  @OneToOne(() => SubmissionLocation)
  @JoinColumn()
  public location: SubmissionLocation;

  @OneToMany(() => SubmissionMedia, (s) => s.blob, { cascade: true })
  public blobs?: SubmissionMedia[];
}

@Entity({
  name: 'submissions_media'
})
export class SubmissionMedia extends GISDayCompetitionBaseEntity {
  @ManyToOne(() => CompetitionSubmission, (s) => s.blobs)
  public submission: CompetitionSubmission;

  @Column({ type: 'varbinary', nullable: false })
  public blob: File; //Express.Multer.File

  @Column({ type: 'nvarchar', length: 32, nullable: true })
  public mimeType: string;
}

export interface ICompetitionSubmission {
  value: string;
  blobs?: ISubmissionMedia[];
}

export interface ISubmissionMedia {
  submission?: CompetitionSubmission;
  blob: File; // Express.Multer.File
  mimeType: string;
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
