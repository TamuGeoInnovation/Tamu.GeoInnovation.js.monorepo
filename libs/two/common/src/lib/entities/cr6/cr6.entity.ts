import { ChildEntity, Column } from 'typeorm';

import { IsNotEmpty, IsDateString } from 'class-validator';

import { StationInfo } from '../station/station.entity';
import { WeatherFlux } from '../weatherflux/weatherflux.interface';

/**
 * Represents a sensor used in the TWO project.
 * Used for WeatherFlux.
 */
@ChildEntity()
export class CR6 extends StationInfo {
  /**
   * Time of data collection
   *
   * Units: yyyy-mm-dd hh:mm:ss
   */
  @Column({ name: 'Timestamp', type: 'datetime', nullable: true })
  @IsNotEmpty()
  @IsDateString()
  public timestamp: string | null = null;

  constructor(row?: WeatherFlux) {
    super();
    if (row) {
      Object.keys(row).forEach((key, index) => {
        const key_lowercase = key.toLowerCase();
        if (key_lowercase in this) {
          if (row[key]) {
            this[key_lowercase] = String(row[key]) || null;
          }
        }
      });
    }
  }
}
