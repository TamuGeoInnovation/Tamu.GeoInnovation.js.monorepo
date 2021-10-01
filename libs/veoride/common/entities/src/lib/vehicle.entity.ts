import { Entity, Column, PrimaryColumn } from 'typeorm';

import { ProviderBase } from './provider-base.entity';

@Entity()
export class Vehicle extends ProviderBase {
  @PrimaryColumn()
  public device_id: string;

  @Column('bigint')
  public last_event_time: string;

  @Column()
  public last_vehicle_state: string;

  @Column()
  public last_event_types: string;

  @Column({ type: 'simple-json' })
  public last_event_location: string;

  @Column({ type: 'simple-json' })
  public current_location: string;

  @Column({ type: 'float' })
  public battery_pct: number;

  public static fromDto(dto: MDSVehicleDto): Vehicle {
    const sc = new Vehicle();

    sc.provider_id = dto.provider_id;
    sc.provider_name = dto.provider_name;
    sc.device_id = dto.device_id;
    sc.vehicle_id = dto.vehicle_id;
    sc.vehicle_type = dto.vehicle_type;
    sc.propulsion_types = dto.propulsion_types.toString();
    sc.last_vehicle_state = dto.last_vehicle_state;
    sc.last_event_types = dto.last_event_types.toString();
    sc.last_event_time = dto.last_event_time.toString();
    sc.last_event_location = dto.last_event_location;
    sc.battery_pct = dto.battery_pct;

    return sc;
  }

  public static toDto(vehicle: Vehicle): Partial<MDSVehicleDto> {
    const dto = {
      provider_id: vehicle.provider_id,
      provider_name: vehicle.provider_name,
      device_id: vehicle.device_id,
      vehicle_id: vehicle.vehicle_id,
      vehicle_type: vehicle.vehicle_type,
      propulsion_types: vehicle.propulsion_types.split(','),
      last_vehicle_state: vehicle.last_vehicle_state,
      last_event_types: vehicle.last_event_types.split(','),
      last_event_time: parseInt(vehicle.last_event_time, 10),
      last_event_location: vehicle.last_event_location,
      current_location: vehicle.current_location,
      battery_pct: vehicle.battery_pct
    };

    return dto;
  }
}

export interface MDSVehicleDto extends Omit<Vehicle, 'propulsion_types' | 'last_event_types' | 'last_event_time'> {
  propulsion_types: Array<string>;
  last_event_types: Array<string>;
  last_event_time: number;
}
