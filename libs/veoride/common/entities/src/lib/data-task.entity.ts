import {
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
  Column
} from 'typeorm';

import { v4 as guid } from 'uuid';

@Entity()
export class DataTask extends BaseEntity {
  @PrimaryColumn()
  public id: string;

  @Column({ default: 'queued' })
  public status: DataTaskStatus;

  @Column()
  public resource: string;

  @Column({ length: 'MAX' })
  public parameters: string;

  @Column()
  public requester: string;

  @UpdateDateColumn()
  public updated: Date;

  @CreateDateColumn()
  public created: Date;

  @BeforeUpdate()
  @BeforeInsert()
  private generateGuid(): void {
    if (this.id === undefined) {
      this.id = guid();
    }
  }
}

export enum DataTaskStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
  FAILED = 'failed'
}
