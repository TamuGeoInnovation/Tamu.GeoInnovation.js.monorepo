import { Entity, Column } from 'typeorm';

import { ProviderBase } from './provider-base.entity';

@Entity()
export class StatusChange extends ProviderBase {
  @Column()
  public vehicle_state: string;

  @Column()
  public event_types: string;

  @Column()
  public event_time: number;

  @Column({ type: 'json' })
  public event_location: string;

  @Column({ type: 'json' })
  public battery_pct: number;

  @Column({ nullable: true })
  public trip_id: string;
}
