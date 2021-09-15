import { Entity, Column, PrimaryColumn } from 'typeorm';

import { ProviderBase } from './provider-base.entity';

@Entity()
export class Trip extends ProviderBase {
  @PrimaryColumn()
  public trip_id: string;

  @Column()
  public trip_duration: number;

  @Column()
  public trip_distance: number;

  @Column({ type: 'simple-json' })
  public route: string;

  @Column()
  public accuracy: number;

  @Column()
  public start_time: number;

  @Column()
  public end_time: number;
}
