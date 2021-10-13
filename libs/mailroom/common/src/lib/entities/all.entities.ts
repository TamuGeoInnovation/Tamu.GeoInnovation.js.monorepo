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
  ManyToMany
} from 'typeorm';

import { Express } from 'express';
import { Multer } from 'multer';

import { v4 as guid } from 'uuid';

@Entity()
export class MailroomBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @PrimaryColumn()
  public guid: string;

  @CreateDateColumn()
  public created: Date;

  @BeforeUpdate()
  @BeforeInsert()
  private setValues(): void {
    if (this.guid === undefined) {
      this.guid = guid();
    }
    if (this.created === undefined) {
      this.created = new Date();
    }
  }
}

@Entity()
export class MailroomEmail extends MailroomBaseEntity implements IMailroomEmail {
  // Reason for length of 320:  https://stackoverflow.com/a/49645137
  @Column({ type: 'nvarchar', length: 320, nullable: false })
  public from: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  public content: string;

  @OneToMany(() => MailroomAttachment, (s) => s.blob, { cascade: true })
  public attachments?: MailroomAttachment[];
}

@Entity()
export class MailroomAttachment extends MailroomBaseEntity implements IMailroomAttachment {
  @ManyToOne(() => MailroomEmail, (email) => email.attachments)
  public email: MailroomEmail;

  @Column({ type: 'binary', nullable: false })
  public blob: Express.Multer.File;
}

//
// Abstract interfaces to prevent circular dependencies and any entity initialization errors due to ordering.
//
export interface IMailroomEmail extends MailroomBaseEntity {
  from: string;

  content: string;

  attachments?: MailroomAttachment[];
}

export interface IMailroomAttachment extends MailroomBaseEntity {
  blob: Express.Multer.File;
}
