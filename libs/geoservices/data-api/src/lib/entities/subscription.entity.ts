import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

import { v4 as guid } from 'uuid';

@Entity('Users_Subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subscriptionGuid: string;

  @CreateDateColumn({ type: 'datetime', nullable: true })
  added: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updatedDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userGuid: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  billingPeriod: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  billingType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  billingAmount: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  billingDayOfMonth: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  numberOfRecords: string;

  @Column({ type: 'bit', nullable: true })
  active: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  recurringProfileID: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  PREF: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  status: string;

  @BeforeUpdate()
  @BeforeInsert()
  private generateGuid(): void {
    if (this.subscriptionGuid === undefined) {
      this.subscriptionGuid = guid();
    }
  }

  @BeforeInsert()
  private _setAdded(): void {
    if (this.added === undefined) {
      this.added = new Date();
    }
  }

  @BeforeUpdate()
  private _setUpdated(): void {
    if (this.updatedDate === undefined) {
      this.updatedDate = new Date();
    }
  }
}
