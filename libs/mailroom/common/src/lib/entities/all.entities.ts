import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  BeforeUpdate,
  BeforeInsert,
  Column,
  OneToMany,
  ManyToOne
} from 'typeorm';

import { Express } from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';

import { EmailStatus } from '../types/mail.types';

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

@Entity({
  name: 'emails'
})
export class MailroomEmail extends MailroomBaseEntity implements IMailroomEmail {
  // Reason for length of 320:  https://stackoverflow.com/a/49645137
  @Column({ type: 'nvarchar', length: 320, nullable: false })
  public from: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  public content?: string;

  @OneToMany(() => MailroomAttachment, (s) => s.blob, { cascade: true })
  public attachments?: MailroomAttachment[];

  @Column({ type: 'tinyint', nullable: true })
  public deliveryStatus?: EmailStatus;
}

@Entity({
  name: 'attachments'
})
export class MailroomAttachment extends MailroomBaseEntity implements IMailroomAttachment {
  @ManyToOne(() => MailroomEmail, (email) => email.attachments)
  public email: MailroomEmail;

  @Column({ type: 'varbinary', nullable: false })
  public blob: Express.Multer.File;

  @Column({ type: 'nvarchar', length: 32, nullable: true })
  public mimeType: string;
}

@Entity({
  name: 'rejects'
})
export class MailroomReject extends MailroomBaseEntity implements IMailroomReject {
  @Column({ type: 'nvarchar', length: 1024, nullable: true })
  public reason?: string;
}

//
// Abstract interfaces to prevent circular dependencies and any entity initialization errors due to ordering.
//
export interface IMailroomEmail extends MailroomBaseEntity {
  from: string;

  content?: string;

  attachments?: MailroomAttachment[];
}

export interface IMailroomAttachment extends MailroomBaseEntity {
  blob: Express.Multer.File;
}

export interface IMailroomReject extends MailroomBaseEntity {
  reason?: string;
}
