import { Entity, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, Column, OneToMany, ManyToOne } from 'typeorm';

import 'multer'; // Without this, get `Namespace 'global.Express' has no exported member 'Multer'.`

import { EmailStatus } from '../types/mail.types';

@Entity()
export class MailroomBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @CreateDateColumn()
  public created: Date;
}

@Entity({
  name: 'emails'
})
export class MailroomEmail extends MailroomBaseEntity implements IMailroomEmail {
  // Reason for length of 320:  https://stackoverflow.com/a/49645137
  @Column({ type: 'nvarchar', length: 320, nullable: false })
  public to: string;

  @Column({ type: 'nvarchar', length: 320, nullable: false })
  public from: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  public text?: string;

  @Column({ type: 'nvarchar', length: '320', nullable: true })
  public subject?: string;

  @OneToMany(() => MailroomAttachment, (s) => s.blob, { cascade: true })
  public attachments?: MailroomAttachment[];

  @Column({ type: 'tinyint', nullable: true })
  public deliveryStatus?: EmailStatus;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  public relayResponse?: string;
}

@Entity({
  name: 'attachments'
})
export class MailroomAttachment extends MailroomBaseEntity implements IMailroomAttachment {
  @ManyToOne(() => MailroomEmail, (email) => email.attachments)
  public email: MailroomEmail;

  @Column({ type: 'varbinary', length: 'MAX', nullable: false })
  public blob: Buffer;

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
  to: string;

  from: string;

  content?: string;

  attachments?: MailroomAttachment[];
}

export interface IMailroomAttachment extends MailroomBaseEntity {
  blob: Buffer;
}

export interface IMailroomReject extends MailroomBaseEntity {
  reason?: string;
}
