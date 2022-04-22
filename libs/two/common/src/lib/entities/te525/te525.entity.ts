import { ChildEntity, Column } from 'typeorm';

import { StationInfo } from '../station/station.entity';
import { WeatherFlux } from '../weatherflux/weatherflux.interface';

/**
 * Represents a sensor used in the TWO project.
 * Used for WeatherFlux.
 */
@ChildEntity()
export class TE525 extends StationInfo {
  /**
   * Total precipitation, sensor 1
   *
   * Units: mm
   */
  @Column({ name: 'Precip1_tot', type: 'double precision', nullable: true })
  public precip1_tot: number | null = null;

  /**
   * Total precipitation, sensor 2
   *
   * Units: mm
   */
  @Column({ name: 'Precip2_Tot', type: 'double precision', nullable: true })
  public precip2_tot: number | null = null;

  constructor(row?: WeatherFlux) {
    super();
    if (row) {
      Object.keys(row).forEach((key) => {
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
