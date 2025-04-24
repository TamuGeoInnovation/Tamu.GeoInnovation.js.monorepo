import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime', nullable: true })
  added: Date;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  firstName: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  lastName: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  name: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  organization: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  password: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  secretAnswer: string;

  @Column({ type: 'int', nullable: true })
  secretQuestionId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  position: string;

  @Column({ type: 'bit', nullable: true })
  notificationServiceOutages: boolean;

  @Column({ type: 'bit', nullable: true })
  notificationServiceUpdates: boolean;

  @Column({ type: 'bit', nullable: true })
  notificationNewsUpdates: boolean;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  apiKey: string;

  @Column({ type: 'bit', nullable: true })
  activated: boolean;

  @Column({ type: 'nchar', length: 255, nullable: true })
  activationKey: string;

  @Column({ type: 'bit', nullable: true })
  nonProfitValidated: boolean;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  address1: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  address2: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  city: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  state: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  zip: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  department: string;

  @Column({ type: 'bit', nullable: true })
  disabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  disabledReason: string;

  @Column({ type: 'bit', nullable: true })
  commercialPartnerValidated: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userGuid: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  signupIPAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastIPAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  deactivationReason: string;

  @Column({ type: 'bit', nullable: true })
  isEmailUnsubscribed: boolean;

  @Column({ type: 'varbinary', length: 255, nullable: true })
  imagePath: Buffer;

  @Column({ type: 'bit', nullable: true })
  includePartner: boolean;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  billingEmail: string;

  @Column({ type: 'int', nullable: true })
  lowCreditLimit: number;

  @Column({ type: 'bit', nullable: true })
  alertLowCredit: boolean;

  @Column({ type: 'bit', nullable: true })
  lowCreditAlerted: boolean;

  @Column({ type: 'bit', nullable: true })
  navteqAuthorized: boolean;

  @Column({ type: 'bit', nullable: true })
  referenceGeometryAuthorized: boolean;
}
