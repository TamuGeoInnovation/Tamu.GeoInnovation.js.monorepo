import { Entity, UpdateDateColumn, BaseEntity, Column, CreateDateColumn, PrimaryColumn, BeforeInsert } from 'typeorm';

import { mdsTimeHourToDate } from '../utils/time.utils';

import { v4 } from 'uuid';

@Entity()
export class Log extends BaseEntity {
  @PrimaryColumn()
  public guid: string;

  @Column()
  public resource: ResourceType;

  @Column()
  public type: LogType;

  @Column()
  public category: string;

  @Column({ nullable: true, type: 'bigint' })
  public collectedTime: string;

  @Column({ nullable: true })
  public count: number;

  @Column({ length: 'MAX', nullable: true })
  public message: string;

  @Column({ type: 'simple-json', nullable: true })
  public details: string;

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public updated: Date;

  public static record(options: CreateLogEntryDto) {
    const l = Log.create();

    l.resource = options.resource;
    l.type = options.type;
    l.category = options.category;

    if (options.collectedTime !== undefined) {
      if (typeof options.collectedTime === 'string') {
        l.collectedTime = mdsTimeHourToDate(options.collectedTime, true).getTime().toString();
      } else {
        l.collectedTime = options.collectedTime.toString();
      }
    }

    l.count = options.count;
    l.message = options.message;
    l.details = options.details as unknown as string;

    return l.save();
  }

  @BeforeInsert()
  private generateGuid(): void {
    if (this.guid === undefined) {
      this.guid = v4();
    }
  }
}

export enum LogType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

export enum ResourceType {
  TRIP = 'trip',
  STATUS_CHANGE = 'status change',
  VEHICLE = 'vehicle',
  DATA_TASK = 'data task'
}
interface CreateLogEntryDto extends Partial<Omit<Log, 'collectedTime' | 'details'>> {
  collectedTime?: number | string;
  details?: object;
}
