import { ChildEntity, Column } from 'typeorm';

import { StationInfo } from '../station/station.entity';
import { WeatherFlux } from '../weatherflux/weatherflux.interface';

/**
 * Represents a sensor used in the TWO project.
 * Used for WeatherFlux.
 */
@ChildEntity()
export class TCAV extends StationInfo {
  /**
   * Average soil temperature for each TCAV sensor;
   * x is an index for the number of TCAV sensors
   *
   * Units: deg C
   */
  @Column({ name: 'TS_1_1_1', type: 'double precision', nullable: true })
  public ts_1_1_1: number | null = null;

  /**
   * Average soil temperature for each TCAV sensor;
   * x is an index for the number of TCAV sensors
   *
   * Units: deg C
   */
  @Column({ name: 'TS_2_1_1', type: 'double precision', nullable: true })
  public ts_2_1_1: number | null = null;

  constructor(row?: WeatherFlux) {
    super();
    if (row) {
      Object.keys(row).forEach((key, index) => {
        const key_lowercase = key.toLowerCase();
        if (key_lowercase in this) {
          if (row[key]) {
            this[key_lowercase] = Number(row[key]) || null;
          }
        }
      });
    }
  }
}
