import { Entity, Column, PrimaryColumn } from 'typeorm';

import { ProviderBase } from './provider-base.entity';

@Entity()
export class StatusChange extends ProviderBase {
  @Column()
  public vehicle_state: string;

  @Column()
  public event_types: string;

  @PrimaryColumn()
  public event_time: number;

  @Column({ type: 'simple-json' })
  public event_location: string;

  @Column()
  public battery_pct: number;

  @Column({ nullable: true })
  public trip_id: string;
}
