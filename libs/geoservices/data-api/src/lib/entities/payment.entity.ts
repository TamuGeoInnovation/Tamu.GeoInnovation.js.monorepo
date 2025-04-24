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

@Entity('Payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentGuid: string;

  @Column({ type: 'int', nullable: true })
  UserId: number;

  @CreateDateColumn({ type: 'datetime', nullable: true })
  added: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updated: Date;

  @Column({ type: 'bit', nullable: true })
  success: boolean;

  @Column({ type: 'int', nullable: true })
  numberOfRecords: number;

  @Column({ type: 'float', nullable: true })
  paymentAmount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentRateGuid: string;

  @Column({ type: 'int', nullable: true })
  fromCount: number;

  @Column({ type: 'int', nullable: true })
  toCount: number;

  @Column({ type: 'float', nullable: true })
  transactionsPerCent: number;

  @Column({ type: 'bit', nullable: true })
  active: boolean;

  @Column({ type: 'varchar', nullable: true })
  comment: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ctsTrans: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'int', nullable: true })
  numberRemaining: number;

  @Column({ type: 'varchar', nullable: true })
  note: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userGuid: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subscriptionGuid: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subscriptionInvoiceGuid: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secureTokenId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  status: string;

  @BeforeUpdate()
  @BeforeInsert()
  private generateGuid(): void {
    if (this.paymentGuid === undefined) {
      this.paymentGuid = guid();
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
    if (this.updated === undefined) {
      this.updated = new Date();
    }
  }
}
