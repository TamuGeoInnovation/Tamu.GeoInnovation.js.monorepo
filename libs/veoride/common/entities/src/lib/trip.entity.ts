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

  @Column({ type: 'bigint' })
  public start_time: number;

  @Column({ type: 'bigint' })
  public end_time: number;

  public static fromDto(dto: MDSTripDto): Trip {
    const trip = new Trip();

    trip.trip_id = dto.trip_id;
    trip.provider_id = dto.provider_id;
    trip.provider_name = dto.provider_name;
    trip.start_time = dto.start_time;
    trip.end_time = dto.end_time;
    trip.propulsion_types = dto.propulsion_types.toString();
    trip.trip_distance = dto.trip_distance;
    trip.trip_duration = dto.trip_duration;
    trip.vehicle_id = dto.vehicle_id;
    trip.vehicle_type = dto.vehicle_type;
    trip.route = dto.route;
    trip.device_id = dto.device_id;
    trip.accuracy = dto.accuracy;

    return trip;
  }
}

export interface MDSTripDto extends Omit<Trip, 'propulsion_types'> {
  propulsion_types: Array<string>;
}
