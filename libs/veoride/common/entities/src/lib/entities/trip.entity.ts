import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';

import { v4 as guid } from 'uuid';

import { ProviderBase } from './provider-base.entity';

@Entity()
export class Trip extends ProviderBase {
  @PrimaryColumn()
  public guid: string;

  @Column()
  public device_id: string;

  @Column()
  public trip_id: string;

  @Column()
  public trip_duration: number;

  @Column()
  public trip_distance: number;

  @Column({ type: 'simple-json' })
  public route: string;

  @Column({ type: 'float' })
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

  public static rawToDto(rawTrip: RawTrip): Partial<MDSTripDto> {
    const trip = {
      trip_id: rawTrip.trip_trip_id,
      provider_id: rawTrip.trip_provider_id,
      provider_name: rawTrip.trip_provider_name,
      start_time: parseInt(rawTrip.trip_start_time, 10),
      end_time: parseInt(rawTrip.trip_end_time, 10),
      propulsion_types: rawTrip.trip_propulsion_types.split(','),
      trip_distance: rawTrip.trip_trip_distance,
      trip_duration: rawTrip.trip_trip_duration,
      vehicle_id: rawTrip.trip_vehicle_id,
      vehicle_type: rawTrip.trip_vehicle_type,
      route: JSON.parse(rawTrip.trip_route),
      device_id: rawTrip.trip_device_id,
      accuracy: rawTrip.trip_accuracy
    };

    return trip;
  }

  @BeforeInsert()
  private generateGuid(): void {
    if (this.guid === undefined) {
      this.guid = guid();
    }
  }
}

export interface MDSTripDto extends Omit<Trip, 'propulsion_types'> {
  propulsion_types: Array<string>;
}

export interface RawTrip {
  trip_accuracy: number;
  trip_device_id: string;
  trip_end_time: string;
  trip_propulsion_types: string;
  trip_provider_id: string;
  trip_provider_name: string;
  trip_route: string;
  trip_start_time: string;
  trip_trip_distance: number;
  trip_trip_duration: number;
  trip_trip_id: string;
  trip_vehicle_id: string;
  trip_vehicle_type: string;
}
