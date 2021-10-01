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

  @Column({ type: 'float' })
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

  public static rawToDto(rawStatusChange: RawStatusChange): Partial<MDSStatusChangeDto> {
    const dto = {
      provider_id: rawStatusChange.status_change_provider_id,
      provider_name: rawStatusChange.status_change_provider_name,
      device_id: rawStatusChange.status_change_device_id,
      vehicle_id: rawStatusChange.status_change_vehicle_id,
      vehicle_type: rawStatusChange.status_change_vehicle_type,
      propulsion_types: rawStatusChange.status_change_propulsion_types.split(','),
      vehicle_state: rawStatusChange.status_change_vehicle_state,
      event_time: parseInt(rawStatusChange.status_change_event_time, 10),
      event_types: rawStatusChange.status_change_event_types.split(','),
      event_location: JSON.parse(rawStatusChange.status_change_event_location),
      battery_pct: rawStatusChange.status_change_battery_pct,
      trip_id: rawStatusChange.status_change_trip_id
    };

    return dto;
  }
}

export interface MDSStatusChangeDto extends Omit<StatusChange, 'propulsion_types' | 'event_types' | 'event_time'> {
  propulsion_types: Array<string>;
  event_types: Array<string>;
  event_time: number;
}

export interface RawStatusChange {
  status_change_provider_id: string;
  status_change_provider_name: string;
  status_change_device_id: string;
  status_change_vehicle_id: string;
  status_change_vehicle_type: string;
  status_change_propulsion_types: string;
  status_change_vehicle_state: string;
  status_change_event_time: string;
  status_change_event_types: string;
  status_change_event_location: string;
  status_change_battery_pct: number;
  status_change_trip_id: string;
}
