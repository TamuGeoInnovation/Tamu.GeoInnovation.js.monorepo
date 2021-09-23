import { Entity, Column, PrimaryColumn } from 'typeorm';

import { ProviderBase } from './provider-base.entity';

@Entity()
export class StatusChange extends ProviderBase {
  @PrimaryColumn()
  public device_id: string;

  @Column()
  public vehicle_state: string;

  @PrimaryColumn()
  public event_types: string;

  @PrimaryColumn('bigint')
  public event_time: string;

  @Column({ type: 'simple-json' })
  public event_location: string;

  @Column()
  public battery_pct: number;

  @Column({ nullable: true })
  public trip_id: string;

  public static fromDto(dto: MDSStatusChangeDto): StatusChange {
    const sc = new StatusChange();

    sc.provider_id = dto.provider_id;
    sc.provider_name = dto.provider_name;
    sc.device_id = dto.device_id;
    sc.vehicle_id = dto.vehicle_id;
    sc.vehicle_type = dto.vehicle_type;
    sc.propulsion_types = dto.propulsion_types.toString();
    sc.vehicle_state = dto.vehicle_state;
    sc.event_types = dto.event_types.toString();
    sc.event_time = dto.event_time.toString();
    sc.event_location = dto.event_location;
    sc.battery_pct = dto.battery_pct;
    sc.trip_id = dto.trip_id;

    return sc;
  }
}

export interface MDSStatusChangeDto extends Omit<StatusChange, 'propulsion_types'> {
  propulsion_types: Array<string>;
}
