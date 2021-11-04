import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public updated: Date;

  public static fromDto(dto: MDSVehicleDto): Vehicle {
    const v = new Vehicle();

    v.provider_id = dto.provider_id;
    v.provider_name = dto.provider_name;
    v.device_id = dto.device_id;
    v.vehicle_id = dto.vehicle_id;
    v.vehicle_type = dto.vehicle_type;
    v.propulsion_types = dto.propulsion_types.toString();
    v.last_vehicle_state = dto.last_vehicle_state;
    v.last_event_types = dto.last_event_types.toString();
    v.last_event_time = dto.last_event_time.toString();
    v.last_event_location = dto.last_event_location;
    v.current_location = dto.current_location;
    v.battery_pct = dto.battery_pct;

    return v;
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
